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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const autoSaveTimerRef = useRef<number | null>(null);

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/app/login');
    }
  }, [navigate]);

      const sendAudioData = useCallback(async (audioBlob: Blob) => {
    if (!wsConnection) return;
    
    try {
      // 将 Blob 转换为 base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      wsConnection.sendAudioChunk(base64);
    } catch (error) {
      console.error('发送音频数据失败:', error);
    }
  }, [wsConnection]);

  const setupMediaRecorder = useCallback((stream: MediaStream) => {
    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          // 发送音频数据到 WebSocket
          sendAudioData(event.data);
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
    } catch (error: unknown) {
      console.error('MediaRecorder 设置失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setError('音频录制器设置失败: ' + errorMessage);
    }
  }, [sendAudioData]);

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
      
      // 设置音频分析
      const audioContext = new AudioContext();
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
      
      // 设置 MediaRecorder
      setupMediaRecorder(stream);
      
    } catch (error: unknown) {
      console.error('麦克风访问被拒绝:', error);
      setMicPermission('denied');
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      setError('麦克风访问失败: ' + errorMessage);
    }
  }, [selectedDeviceId, setupMediaRecorder]);

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

  const connectWebSocket = async (sessionId: string) => {
    try {
      setConnectionState('connecting');
      setConnectionStatus('连接服务器中...');
      
      const token = getToken();
      if (!token) {
        throw new Error('未找到认证令牌');
      }
      
      const connection = new LiveMeetingConnection(sessionId, token);
      
      // 设置事件监听器
      connection.on('connected', () => {
        console.log('WebSocket 连接成功');
        setConnectionState('connected');
        setConnectionStatus('已连接');
        setError(null);
      });
      
      connection.on('disconnected', () => {
        console.log('WebSocket 连接断开');
        setConnectionState('disconnected');
        setConnectionStatus('连接断开');
      });
      
        connection.on('transcript', (data: Record<string, unknown>) => {
    console.log('收到转写结果:', data);
    addTranscriptItem(data);
  });
  
  connection.on('error', (data: Record<string, unknown>) => {
    console.error('WebSocket 错误:', data);
    setError(String(data.message) || '连接错误');
    setConnectionState('error');
  });
  
  connection.on('status', (data: Record<string, unknown>) => {
    console.log('状态更新:', data);
    setConnectionStatus(String(data.message) || '');
  });
      
      await connection.connect();
      setWsConnection(connection);
      
      } catch (error: unknown) {
    console.error('WebSocket 连接失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    setError('连接失败: ' + errorMessage);
    setConnectionState('error');
    setRecordingState('error');
  }
  };

  const addTranscriptItem = (transcriptData: Record<string, unknown>) => {
      const newItem: TranscriptItem = {
    id: String(transcriptData.id) || Date.now().toString(),
    text: String(transcriptData.text || transcriptData.transcript || ''),
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
      await connectWebSocket(sessionData.sessionId);
      
      // 开始录音
      if (mediaRecorderRef.current && streamRef.current) {
        audioChunksRef.current = [];
        mediaRecorderRef.current.start(1000); // 每秒收集一次数据
        
        // 通知服务器开始录制
        wsConnection?.startRecording({
          sample_rate: 16000,
          format: 'webm'
        });
        
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
    console.error('启动录制失败:', error);
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    setError('启动录制失败: ' + errorMessage);
    setRecordingState('error');
  }
  };

  const stop = async () => {
    try {
      setRecordingState('stopped');
      
      // 停止录音
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      
      // 通知服务器停止录制
      wsConnection?.stopRecording();
      
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      wsConnection?.sendMessage('pause_recording');
      setRecordingState('paused');
      
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    }
  };

  const resume = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
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
  useEffect(() => {
    checkAudioDevices();
    return () => {
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
      if (wsConnection) {
        wsConnection.disconnect();
      }
    };
  }, [checkAudioDevices, wsConnection]);

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


