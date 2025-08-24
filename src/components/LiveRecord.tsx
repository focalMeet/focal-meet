import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  Settings, 
  Volume2, 
  Wifi, 
  WifiOff,
  AlertTriangle,
  ArrowLeft,
  MessageSquare,
  Save
} from 'lucide-react';
import { 
  createSession, 
  LiveMeetingConnection, 
  SessionCreated,
  updateNote
} from '../lib/api';
import { isAuthenticated, getToken } from '../lib/auth';

type RecordingState = 'idle' | 'preparing' | 'recording' | 'paused' | 'stopped' | 'error';
type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

interface TranscriptItem {
  id: string;
  text: string;
  timestamp: number;
  speaker?: string;
  confidence?: number;
  is_final?: boolean;
}

const LiveRecord: React.FC = () => {
  const navigate = useNavigate();
  
  // Basic states
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [isRecordingActive, setIsRecordingActive] = useState(false);
  const [speechRecognitionStarted, setSpeechRecognitionStarted] = useState(false);
  const [serverRecordingConfirmed, setServerRecordingConfirmed] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [title, setTitle] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  
  // Audio states
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt' | 'checking'>('checking');
  const [audioLevel, setAudioLevel] = useState(0);
  const [hasAudioDevices, setHasAudioDevices] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  
  // Session and WebSocket states
  const [session, setSession] = useState<SessionCreated | null>(null);
  const [wsConnection, setWsConnection] = useState<LiveMeetingConnection | null>(null);
  const wsConnectionRef = useRef<LiveMeetingConnection | null>(null);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // UI states
  const [showSettings, setShowSettings] = useState(false);
  const [isAutoSave, setIsAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: '可以在这里记录会议过程你的笔记，支持markdown格式',
        emptyEditorClass: 'is-editor-empty',
        includeChildren: true,
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[65vh] md:min-h-[72vh]'
      }
    },
  });
  // Refs
  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<ScriptProcessorNode | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<number | null>(null);

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/app/login');
    }
  }, [navigate]);

  // 计算音频级别（RMS值）
  const calculateAudioLevel = useCallback((pcmData: Int16Array): number => {
    let sum = 0;
    for (let i = 0; i < pcmData.length; i++) {
      sum += pcmData[i] * pcmData[i];
    }
    return Math.sqrt(sum / pcmData.length);
  }, []);

  const sendAudioData = useCallback(async (pcmData: ArrayBuffer) => {
    if (!wsConnection) {
      console.warn('🔴 WebSocket连接不存在，跳过音频数据');
      return;
    }
    
    try {
      // 将 PCM 数据转换为 base64
      const base64 = btoa(String.fromCharCode(...new Uint8Array(pcmData)));
      console.debug('🎵 发送音频数据:', base64.length, '字符');
      
      wsConnection.sendAudioChunk(base64);
    } catch (error) {
      console.error('发送音频数据失败:', error);
    }
  }, [wsConnection]);

  const setupPCMRecorder = useCallback((stream: MediaStream, audioContext: AudioContext, microphone: MediaStreamAudioSourceNode) => {
    try {
      // 使用共享的 AudioContext 和 microphone
      
      // 创建ScriptProcessorNode来处理音频数据
      const bufferSize = 4096; // 缓冲区大小
      const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
      
      // PCM数据缓冲区 - 按腾讯云要求每40ms发送1280字节
      let pcmBuffer: Float32Array[] = [];
      let bufferLength = 0;
      const samplesPerChunk = 640; // 40ms @ 16kHz = 640个样本 = 1280字节
      
      processor.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0); // 获取单声道数据
        
        // 检查输入音频数据
        const maxInput = Math.max(...Array.from(inputData));
        const minInput = Math.min(...Array.from(inputData));
        const inputLevel = Math.sqrt(Array.from(inputData).reduce((sum, sample) => sum + sample * sample, 0) / inputData.length);
        
        if (inputLevel > 0.001) { // 只有在有音频输入时才记录
          console.debug('🎤 音频输入检测:', {
            samples: inputData.length,
            max: maxInput.toFixed(6),
            min: minInput.toFixed(6), 
            level: inputLevel.toFixed(6),
            firstSamples: Array.from(inputData.slice(0, 5)).map(s => s.toFixed(6))
          });
        }
        
        // 复制数据到缓冲区
        const channelData = new Float32Array(inputData.length);
        channelData.set(inputData);
        pcmBuffer.push(channelData);
        bufferLength += channelData.length;
        
        // 当缓冲区达到目标大小时发送数据（40ms，符合腾讯云要求）
        while (bufferLength >= samplesPerChunk) {
          // 合并缓冲区中的数据
          const totalData = new Float32Array(bufferLength);
          let offset = 0;
          for (const buffer of pcmBuffer) {
            totalData.set(buffer, offset);
            offset += buffer.length;
          }
          
          // 提取前640个样本（40ms数据）
          const chunkData = totalData.slice(0, samplesPerChunk);
          
          // 转换为16位PCM
          const pcm16 = new Int16Array(chunkData.length);
          for (let i = 0; i < chunkData.length; i++) {
            // 将float32 (-1到1) 转换为int16 (-32768到32767)
            pcm16[i] = Math.max(-32768, Math.min(32767, Math.round(chunkData[i] * 32767)));
          }
          
          // 音频数据质量检查
          const audioLevel = calculateAudioLevel(pcm16);
          const isValidAudio = audioLevel > 50; // 设置最小音量阈值
          
          // 只在录制激活且服务器确认后发送有效的PCM数据
          if (isRecordingActive && serverRecordingConfirmed) {
            if (isValidAudio) {
              // 详细调试PCM数据
              console.debug('🎵 发送40ms音频数据，样本数:', pcm16.length, '音量级别:', audioLevel);
              console.debug('🔍 前端PCM采样点示例:', Array.from(pcm16.slice(0, 10)));
              console.debug('🔍 原始Float32示例:', Array.from(chunkData.slice(0, 10)));
              
              // 创建正确的字节数组确保little-endian字节序
              const bytes = new Uint8Array(pcm16.length * 2);
              for (let i = 0; i < pcm16.length; i++) {
                const sample = pcm16[i];
                bytes[i * 2] = sample & 0xFF;        // 低字节
                bytes[i * 2 + 1] = (sample >> 8) & 0xFF; // 高字节
              }
              
              console.debug('🔍 字节数组头部:', Array.from(bytes.slice(0, 20)));
              sendAudioData(bytes.buffer);
            } else {
              console.debug('🔇 跳过40ms静音数据，音量级别:', audioLevel);
            }
          } else if (isRecordingActive && !serverRecordingConfirmed) {
            console.debug('⏳ 等待服务器录制确认中，暂不发送音频数据');
          }
          
          // 保留剩余数据继续下次处理
          const remainingData = totalData.slice(samplesPerChunk);
          pcmBuffer = remainingData.length > 0 ? [remainingData] : [];
          bufferLength = remainingData.length;
        }
      };
      
      // 连接音频节点
      microphone.connect(processor);
      processor.connect(audioContext.destination);
      
      // 保存引用用于停止
      mediaRecorderRef.current = processor;
      
    } catch (error: unknown) {
      console.error('PCM录制器设置失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setError('音频录制器设置失败: ' + errorMessage);
    }
  }, [sendAudioData, isRecordingActive, wsConnection, speechRecognitionStarted, serverRecordingConfirmed, calculateAudioLevel]);

  const requestMicrophoneAccess = useCallback(async (deviceId?: string) => {
    try {
      const constraints = {
        audio: {
          deviceId: deviceId || selectedDeviceId || undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setMicPermission('granted');
      setError(null);
      
      // 停止之前的流
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      streamRef.current = stream;
      
      // 设置音频分析，配置16kHz采样率
      const audioContext = new AudioContext({ sampleRate: 16000 });
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      // 开始检测音频级别
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const detectAudio = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average);
          requestAnimationFrame(detectAudio);
        }
      };
      detectAudio();
      
      // 设置 PCM 录制器，共享 AudioContext
      setupPCMRecorder(stream, audioContext, microphone);
      
    } catch (error: unknown) {
      console.error('麦克风访问被拒绝:', error);
      setMicPermission('denied');
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setError('麦克风访问失败: ' + errorMessage);
    }
  }, [selectedDeviceId, sendAudioData, isRecordingActive, wsConnection, speechRecognitionStarted, serverRecordingConfirmed, setupPCMRecorder]);

  const checkAudioDevices = useCallback(async () => {
    try {
      // 获取所有设备
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
      
      if (audioInputDevices.length === 0) {
        setMicPermission('denied');
        setHasAudioDevices(false);
        setError('未检测到麦克风设备');
        return;
      }
      
      setHasAudioDevices(true);
      setAudioDevices(audioInputDevices);
      
      // 设置默认设备
      if (!selectedDeviceId && audioInputDevices.length > 0) {
        setSelectedDeviceId(audioInputDevices[0].deviceId);
      }
      
      // 检查麦克风权限
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        
        if (permissionStatus.state === 'granted') {
          await requestMicrophoneAccess();
        } else if (permissionStatus.state === 'denied') {
          setMicPermission('denied');
          setError('麦克风权限被拒绝，请在浏览器设置中允许麦克风访问');
        } else {
          setMicPermission('prompt');
        }
      } catch {
        // 如果浏览器不支持 permissions API，直接尝试请求
        await requestMicrophoneAccess();
      }
    } catch (error: unknown) {
      console.error('音频设备检查失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setError('音频设备检查失败: ' + errorMessage);
      setMicPermission('denied');
    }
  }, [selectedDeviceId, requestMicrophoneAccess]);

  const createNewSession = async () => {
    try {
      setConnectionStatus('创建会话中...');
      const sessionData = await createSession();
      setSession(sessionData);
      setConnectionStatus('会话创建成功');
      return sessionData;
      } catch (error: unknown) {
    console.error('创建会话失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    setError('创建会话失败: ' + errorMessage);
    setRecordingState('error');
    throw error;
  }
  };

  const connectWebSocket = async (sessionId: string): Promise<LiveMeetingConnection> => {
    try {
      console.log('🔌 开始连接WebSocket, sessionId:', sessionId);
      setConnectionState('connecting');
      setConnectionStatus('连接服务器中...');
      
      const token = getToken();
      if (!token) {
        throw new Error('未找到认证令牌');
      }
      
      const connection = new LiveMeetingConnection(sessionId, token);
      
            // 创建Promise来等待连接建立
      const connectionPromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.error('🔴 WebSocket连接超时，10秒内未收到connection_ready');
          reject(new Error('WebSocket连接超时 - 未收到connection_ready事件'));
        }, 10000); // 10秒超时
        
      connection.on('connection_ready', () => {
          console.log('✅ WebSocket connection_ready事件已收到');
        setConnectionState('connected');
        setConnectionStatus('已连接');
        setError(null);
          clearTimeout(timeout);
          resolve();
        });
        
        connection.on('error', (error: any) => {
          console.error('🔴 WebSocket连接错误:', error);
          clearTimeout(timeout);
          reject(error);
        });
        
                // 添加额外的断开连接检测
        const onDisconnected = () => {
          console.error('🔴 WebSocket在建立过程中断开');
          clearTimeout(timeout);
          connection.off('disconnected', onDisconnected);
          reject(new Error('WebSocket在建立过程中断开'));
        };
        connection.on('disconnected', onDisconnected);
      });
      
      connection.on('disconnected', () => {
        console.log('🔴 WebSocket 连接断开');
        setConnectionState('disconnected');
        setConnectionStatus('连接断开');
      });
      
      // 监听转写结果（包括实时和最终结果）
      connection.on('transcript_partial', (data: Record<string, unknown>) => {
        console.log('收到实时转写结果:', data);
        addTranscriptItem(data);
      });
      
      connection.on('transcript_final', (data: Record<string, unknown>) => {
        console.log('收到最终转写结果:', data);
        addTranscriptItem(data);
      });
      
      // 监听状态更新
      connection.on('status_update', (data: Record<string, unknown>) => {
        console.log('状态更新:', data);
        setConnectionStatus(String(data.message) || '');
      });
      
      // 监听录制状态消息
      connection.on('recording_started', (data: Record<string, unknown>) => {
        console.log('✅ 录制已启动:', data);
        const message = String(data.message) || '录制中...';
        setConnectionStatus(message);
        setServerRecordingConfirmed(true); // 服务器确认录制已开始
        
        // 延迟连接成功的特殊提示
        if (data.delayed_connection) {
          console.log('🎉 延迟连接成功，现在可以开始说话了！');
        } else if (data.immediate_connection) {
          console.log('🎉 腾讯云连接成功，现在可以开始说话了！');
        }
      });

      connection.on('connection_pending', (data: Record<string, unknown>) => {
        console.log('⏳ 连接延迟中:', data);
        setConnectionStatus(String(data.message) || '正在连接腾讯云，请稍候...');
        // 保持等待状态，不设置serverRecordingConfirmed为true
        console.log('📢 请稍候，腾讯云连接建立中，暂时不要说话');
      });
      
      connection.on('recording_stopped', (data: Record<string, unknown>) => {
        console.log('录制已停止:', data);
        setConnectionStatus(String(data.message) || '录制已停止');
      });
      
      connection.on('recording_paused', (data: Record<string, unknown>) => {
        console.log('录制已暂停:', data);
        setConnectionStatus(String(data.message) || '录制已暂停');
      });
      
      connection.on('recording_resumed', (data: Record<string, unknown>) => {
        console.log('录制已恢复:', data);
        setConnectionStatus(String(data.message) || '录制中...');
      });
  
      connection.on('error', (data: Record<string, unknown>) => {
        console.error('🔴 WebSocket 错误:', data);
        const errorCode = String(data.error_code || '');
        const errorMessage = String(data.message) || '连接错误';
        
        if (errorCode === 'AUDIO_FORMAT_ERROR') {
          console.error('🎵 音频格式错误，可能需要调整音频采集设置');
          setError('音频格式错误：' + errorMessage);
          // 不断开连接，让用户重新尝试或调整设置
        } else {
          setError(errorMessage);
          setConnectionState('error');
        }
      });
      
      console.log('正在连接WebSocket...');
      await connection.connect();
      console.log('WebSocket连接成功，设置连接对象');
      // 等待连接建立
      console.log('⏳ 等待connection_ready事件...');
      await connectionPromise;
      console.log('✅ connection_ready事件已收到');
      
      // 连接健康检查
      console.log('✅ WebSocket连接就绪，状态:', connection.ws?.readyState);
      
      setWsConnection(connection);
      wsConnectionRef.current = connection;
      
      return connection; // 返回连接对象
      
      } catch (error: unknown) {
    console.error('🔴 WebSocket 连接失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    setError('WebSocket连接失败: ' + errorMessage);
    setConnectionState('error');
    setRecordingState('error');
    throw error; // 重新抛出错误，阻止 start() 函数继续执行
  }
  };

  const addTranscriptItem = (transcriptData: Record<string, unknown>) => {
      const newItem: TranscriptItem = {
    id: String(transcriptData.segment_id) || Date.now().toString(),
    text: String(transcriptData.text || ''),
    timestamp: Date.now(),
    speaker: transcriptData.speaker ? String(transcriptData.speaker) : undefined,
    confidence: typeof transcriptData.confidence === 'number' ? transcriptData.confidence : undefined,
    is_final: transcriptData.is_final !== false
  };
    
    setTranscripts(prev => {
      // 如果是相同 ID 的更新，替换之前的项
      const existingIndex = prev.findIndex(item => item.id === newItem.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newItem;
        return updated;
      }
      
      // 否则添加新项
      return [...prev, newItem];
    });
    
    // 自动滚动到底部
    setTimeout(() => {
      transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

    const saveNotes = useCallback(async () => {
    if (!session || !editor) return;
    
    try {
      const content = editor.getHTML();
      await updateNote(session.noteId, {
        title: title || '实时录制会议',
        content: { user_notes: content }
      });
      setLastSaved(new Date());
      console.log('笔记保存成功');
    } catch (error: unknown) {
      console.error('保存笔记失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setError('保存笔记失败: ' + errorMessage);
    }
  }, [session, editor, title]);

  // 自动保存功能
  useEffect(() => {
    if (!isAutoSave || !hasStarted) return;
    
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    autoSaveTimerRef.current = window.setTimeout(() => {
      saveNotes();
    }, 30000); // 30秒自动保存
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [editor, isAutoSave, hasStarted, saveNotes]);

  const start = async () => {
    if (recordingState === 'recording') return;
    
    try {
      setRecordingState('preparing');
      setError(null);
      
      // 创建会话
      const sessionData = await createNewSession();
      
      // 连接 WebSocket
      const connection = await connectWebSocket(sessionData.sessionId);
      
      // 开始录音
      if (mediaRecorderRef.current && streamRef.current) {
        audioChunksRef.current = [];
        setIsRecordingActive(true); // 激活PCM数据发送
        
        // 通知服务器开始录制
        console.log('🚀 准备发送录制开始消息，使用连接对象:', !!connection);
        console.log('🚀 WebSocket连接已建立，调用startRecording');
        
        // 添加小延迟确保连接完全稳定
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const audioConfig = {
          sample_rate: 16000,
          format: 'pcm',
          voice_format: 1,
          engine_type: '16k_zh'
        };
        console.log('🚀 调用startRecording，参数:', audioConfig);
        
        connection.startRecording(audioConfig);
        setSpeechRecognitionStarted(true);
        
        console.log('✅ startRecording消息已发送');
        
        setRecordingState('recording');
    setHasStarted(true);
        
        // 启动计时器
    timerRef.current = window.setInterval(() => {
      setElapsed((s) => s + 1);
    }, 1000);
        
        setConnectionStatus('录制中...');
      } else {
        throw new Error('音频设备未就绪');
      }
      
      } catch (error: unknown) {
    console.error('🔴 启动录制失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    setError('启动录制失败: ' + errorMessage);
    setRecordingState('error');
    
    // 确保清理连接状态
    setIsRecordingActive(false);
    setSpeechRecognitionStarted(false);
    setServerRecordingConfirmed(false);
    
    // 如果WebSocket已连接，确保断开连接
    if (wsConnection) {
      console.log('🔴 错误发生，断开WebSocket连接');
      wsConnection.disconnect();
      setWsConnection(null);
      wsConnectionRef.current = null;
    }
  }
  };

  const stop = async () => {
    try {
      setRecordingState('stopped');
      
      // 停止录音
      setIsRecordingActive(false); // 停止发送PCM数据
      setSpeechRecognitionStarted(false); // 重置语音识别状态
      setServerRecordingConfirmed(false); // 重置服务器确认状态
      if (mediaRecorderRef.current) {
        // 断开音频节点连接
        try {
          mediaRecorderRef.current.disconnect();
          // AudioContext 会在组件清理时关闭
        } catch (error) {
          console.error('停止PCM录制器失败:', error);
        }
      }
      
      // 通知服务器停止录制
      wsConnection?.stopRecording();
      
      // 断开WebSocket连接
      if (wsConnection) {
        wsConnection.disconnect();
        setWsConnection(null);
        wsConnectionRef.current = null;
      }
      
      // 停止计时器
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // 保存最终笔记
      await saveNotes();
      
      setConnectionStatus('录制已停止');
      
      // 跳转到会议详情页
      if (session) {
        navigate(`/app/meetings/${session.sessionId}`);
      }
      
      } catch (error: unknown) {
    console.error('停止录制失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    setError('停止录制失败: ' + errorMessage);
  }
  };

  const pause = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      setIsRecordingActive(false); // 停止发送PCM数据
      wsConnection?.sendMessage('pause_recording');
      setRecordingState('paused');
      
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    }
  };

  const resume = () => {
    if (mediaRecorderRef.current && recordingState === 'paused') {
      setIsRecordingActive(true); // 恢复发送PCM数据
      setSpeechRecognitionStarted(false); // 重置状态，让保险方案重新启动识别
      setServerRecordingConfirmed(false); // 重置服务器确认状态
      wsConnection?.sendMessage('resume_recording');
      setRecordingState('recording');
      
      timerRef.current = window.setInterval(() => {
        setElapsed((s) => s + 1);
      }, 1000);
    }
  };

  const handleDeviceChange = async (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    if (micPermission === 'granted') {
      await requestMicrophoneAccess(deviceId);
    }
  };

  // 初始化和清理
  // 组件挂载时初始化音频设备
  useEffect(() => {
    checkAudioDevices();
  }, [checkAudioDevices]);
  
  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      console.log('🧹 组件卸载，清理资源');
      // 清理定时器
      if (timerRef.current) clearInterval(timerRef.current);
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      
      // 清理音频设备
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      
      // 清理 WebSocket 连接
      if (wsConnectionRef.current) {
        console.log('🧹 组件卸载时断开WebSocket连接');
        wsConnectionRef.current.disconnect();
      }
    };
  }, []); // 空依赖数组，只在组件卸载时运行

  const format = (s: number) => {
    const hh = Math.floor(s / 3600);
    const mm = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    return [hh, mm, ss].map((n) => String(n).padStart(2, '0')).join(':');
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getRecordingStateIcon = () => {
    switch (recordingState) {
      case 'recording':
        return <Mic className="w-5 h-5 text-red-400" />;
      case 'paused':
        return <Play className="w-5 h-5 text-yellow-400" />;
      case 'preparing':
        return <div className="w-5 h-5 bg-blue-500 rounded-full animate-pulse" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <MicOff className="w-5 h-5 text-gray-400" />;
    }
  };

  const getConnectionStateIcon = () => {
    switch (connectionState) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-400" />;
      case 'connecting':
        return <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse" />;
      case 'error':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      default:
        return <WifiOff className="w-4 h-4 text-gray-400" />;
    }
  };

  const getMicrophoneStatus = () => {
    if (micPermission === 'checking') {
      return {
        icon: <div className="w-5 h-5 bg-gray-500 rounded-full animate-pulse" />,
        text: '检测麦克风设备中...',
        canStart: false
      };
    }
    
    if (!hasAudioDevices) {
      return {
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
        text: '未检测到麦克风设备',
        canStart: false
      };
    }
    
    if (micPermission === 'denied') {
      return {
        icon: <MicOff className="w-5 h-5 text-red-500" />,
        text: '麦克风访问被拒绝',
        canStart: false,
        showRetryButton: true
      };
    }
    
    if (micPermission === 'prompt') {
      return {
        icon: <MicOff className="w-5 h-5 text-yellow-500" />,
        text: '需要麦克风权限',
        canStart: false,
        showRetryButton: true
      };
    }
    
    if (micPermission === 'granted') {
      const level = Math.min(100, (audioLevel / 50) * 100);
      return {
        icon: (
          <div className="flex items-center space-x-2">
            <Mic className="w-5 h-5 text-green-500" />
            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-100 rounded-full"
                style={{ width: `${level}%` }}
              />
            </div>
          </div>
        ),
        text: '麦克风正常工作',
        canStart: true
      };
    }
    
    return {
      icon: <MicOff className="w-5 h-5 text-gray-400" />,
      text: '未知状态',
      canStart: false
    };
  };

  const micStatus = getMicrophoneStatus();
  const canStart = micStatus.canStart && recordingState === 'idle';
  const isRecording = recordingState === 'recording';

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/app/meetings')}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
              {getRecordingStateIcon()}
              <h1 className="text-xl font-semibold text-white">
                {recordingState === 'idle' ? '实时录制' :
                 recordingState === 'preparing' ? '准备中...' :
                 recordingState === 'recording' ? '录制中' :
                 recordingState === 'paused' ? '已暂停' :
                 recordingState === 'stopped' ? '已停止' : '出错'}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              {getConnectionStateIcon()}
              <span>{connectionStatus || '未连接'}</span>
            </div>
            
            {/* Timer */}
            {hasStarted && (
              <div className="text-2xl font-mono font-bold text-red-400 flex items-center">
                {isRecording && <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-3" />}
                {format(elapsed)}
              </div>
            )}
            
            {/* Settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-400">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="mx-6 mt-4 p-4 bg-black/20 border border-white/10 rounded-lg">
            <h3 className="text-white font-medium mb-3">录制设置</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">麦克风设备</label>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => handleDeviceChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  {audioDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId} className="bg-gray-800">
                      {device.label || `麦克风 ${device.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">自动保存笔记</span>
                <button
                  onClick={() => setIsAutoSave(!isAutoSave)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isAutoSave ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isAutoSave ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Notes Editor */}
          <div className="flex-1 flex flex-col">
            {/* Title Input */}
            {!hasStarted && (
              <div className="p-6 flex justify-center">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="会议标题..."
                  className="w-full max-w-md px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40 text-center"
                />
              </div>
            )}
            
            {hasStarted && (
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="会议标题..."
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40"
                  />
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={saveNotes}
                      className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                      title="手动保存"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    {lastSaved && (
                      <span className="text-xs text-gray-500">
                        已保存 {lastSaved.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Notes Editor */}
            {hasStarted && (
              <div className="flex-1 p-6 overflow-hidden">
                <div className="h-full bg-black/20 border border-white/10 rounded-xl p-4 overflow-y-auto">
                  <div className="prose prose-invert max-w-none leading-relaxed prose-p:my-1 prose-headings:my-2 prose-h1:my-3 prose-h2:my-2 prose-h3:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-pre:my-2">
                    <EditorContent editor={editor} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Transcript & Controls */}
          <div className="w-96 border-l border-white/10 flex flex-col">
            {/* Microphone Status */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium">麦克风状态</h3>
                <Volume2 className="w-4 h-4 text-gray-400" />
              </div>
              
              <div className="flex items-center space-x-3 mb-3">
                {micStatus.icon}
                <span className="text-sm text-gray-300">{micStatus.text}</span>
              </div>
              
                {micStatus.showRetryButton && (
                  <button 
                  onClick={() => requestMicrophoneAccess()}
                  className="w-full px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors text-sm"
                  >
                  重新授权
                  </button>
                )}
              </div>
              
            {/* Recording Controls */}
            <div className="p-4 border-b border-white/10">
              <div className="flex flex-col space-y-3">
                {recordingState === 'idle' && (
                  <button 
                    onClick={start}
                    disabled={!canStart}
                    className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Mic className="w-5 h-5" />
                    <span>开始录制</span>
                  </button>
                )}
                
                {recordingState === 'preparing' && (
                  <button 
                    disabled
                    className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg opacity-50 cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <div className="w-5 h-5 bg-white rounded-full animate-pulse" />
                    <span>准备中...</span>
                  </button>
                )}
                
                {recordingState === 'recording' && (
                  <div className="space-y-2">
                    <button 
                      onClick={pause}
                      className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <Play className="w-5 h-5" />
                      <span>暂停</span>
                    </button>
                    <button 
                      onClick={stop}
                      className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <Square className="w-5 h-5" />
                      <span>停止录制</span>
                    </button>
                  </div>
                )}
                
                {recordingState === 'paused' && (
                  <div className="space-y-2">
                    <button 
                      onClick={resume}
                      className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <Play className="w-5 h-5" />
                      <span>继续录制</span>
                    </button>
                    <button 
                      onClick={stop}
                      className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <Square className="w-5 h-5" />
                      <span>停止录制</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Transcript Display */}
            {hasStarted && (
              <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                    <h3 className="text-white font-medium">实时转写</h3>
                    <span className="text-xs text-gray-500">({transcripts.length})</span>
          </div>
        </div>

                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-3">
                    {transcripts.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>等待转写结果...</p>
                      </div>
                    ) : (
                      transcripts.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3 rounded-lg ${
                            item.is_final ? 'bg-white/5 border border-white/10' : 'bg-blue-500/10 border border-blue-500/20'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-xs text-gray-400">
                              {item.speaker && `${item.speaker} • `}
                              {formatTimestamp(item.timestamp)}
                            </span>
                            {item.confidence && (
                              <span className="text-xs text-gray-500">
                                {Math.round(item.confidence * 100)}%
                              </span>
                            )}
                          </div>
                          <p className={`text-sm ${item.is_final ? 'text-gray-300' : 'text-blue-300'}`}>
                            {item.text}
                          </p>
                        </div>
                      ))
                    )}
                    <div ref={transcriptEndRef} />
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveRecord;


