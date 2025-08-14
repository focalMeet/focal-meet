import React, { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

const LiveRecord: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [title, setTitle] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt' | 'checking'>('checking');
  const [audioLevel, setAudioLevel] = useState(0);
  const [hasAudioDevices, setHasAudioDevices] = useState(false);
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
  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const checkAudioDevices = async () => {
    try {
      // 首先检查是否有音频设备
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputDevices = devices.filter(device => device.kind === 'audioinput');
      
      if (audioInputDevices.length === 0) {
        setMicPermission('denied');
        setHasAudioDevices(false);
        return;
      }
      
      setHasAudioDevices(true);
      
      // 检查麦克风权限
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      
      if (permissionStatus.state === 'granted') {
        await requestMicrophoneAccess();
      } else if (permissionStatus.state === 'denied') {
        setMicPermission('denied');
      } else {
        setMicPermission('prompt');
      }
    } catch (error) {
      // 如果浏览器不支持 permissions API，尝试直接请求
      await requestMicrophoneAccess();
    }
  };

  const requestMicrophoneAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission('granted');
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
      
    } catch (error) {
      console.error('麦克风访问被拒绝:', error);
      setMicPermission('denied');
    }
  };

  const start = () => {
    if (timerRef.current) return;
    setHasStarted(true);
    setIsRecording(true);
    timerRef.current = window.setInterval(() => {
      setElapsed((s) => s + 1);
    }, 1000);
  };

  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  };

  useEffect(() => {
    checkAudioDevices();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const format = (s: number) => {
    const hh = Math.floor(s / 3600);
    const mm = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    return [hh, mm, ss].map((n) => String(n).padStart(2, '0')).join(':');
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
        icon: <div className="w-5 h-5 bg-red-500 rounded-full" />,
        text: '未检测到麦克风设备',
        canStart: false
      };
    }
    
    if (micPermission === 'denied') {
      return {
        icon: <div className="w-5 h-5 bg-red-500 rounded-full" />,
        text: '麦克风访问被拒绝',
        canStart: false,
        showRetryButton: true
      };
    }
    
    if (micPermission === 'prompt') {
      return {
        icon: <div className="w-5 h-5 bg-yellow-500 rounded-full" />,
        text: '需要麦克风权限',
        canStart: false,
        showRetryButton: true
      };
    }
    
    if (micPermission === 'granted') {
      const level = Math.min(100, (audioLevel / 50) * 100);
      return {
        icon: (
          <div className="flex items-center space-x-1">
            <div className="w-5 h-5 bg-green-500 rounded-full" />
            <div className="w-12 h-2 bg-gray-700 rounded-full overflow-hidden">
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
      icon: null,
      text: '',
      canStart: false
    };
  };

  const micStatus = getMicrophoneStatus();

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full" style={{ maxWidth: '60rem' }}>
        <div
          className={`absolute inset-x-0 transition-all duration-500 ${hasStarted ? 'top-20' : 'top-1/2 -translate-y-1/2'} transform`}>
          <div className={`flex items-center space-x-4 ${!hasStarted ? 'justify-center' : ''}`}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Meeting Title: ..."
              className={`px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40 ${hasStarted ? 'flex-1' : 'w-[28rem]'}`}
            />
            
            {hasStarted && (
              <div className="text-2xl md:text-3xl font-mono font-bold text-red-400 flex items-center">
                {isRecording && <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-3" />}
                {format(elapsed)}
              </div>
            )}
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {micStatus.icon}
                <span className="text-sm text-gray-400">
                  {micStatus.text}
                </span>
                {micStatus.showRetryButton && (
                  <button 
                    onClick={requestMicrophoneAccess}
                    className="ml-2 px-3 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors"
                  >
                    授权
                  </button>
                )}
              </div>
              
              <div className="flex space-x-2">
                {!isRecording ? (
                  <button 
                    onClick={start}
                    className="px-5 py-3 md:px-6 md:py-3 text-base md:text-lg bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg whitespace-nowrap"
                  >
                    Start
                  </button>
                ) : (
                  <button onClick={stop} className="px-5 py-3 md:px-6 md:py-3 text-base md:text-lg bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg whitespace-nowrap">
                    Stop
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {hasStarted && (
          <div className="pt-32 pb-6 h-full overflow-hidden" style={{ paddingTop: '10rem' }}>
            <div className="bg-black/30 border border-white/10 rounded-2xl p-4 h-full max-h-[calc(100vh-10rem)] overflow-y-auto">
              <div className="prose prose-invert max-w-none leading-relaxed prose-p:my-1 prose-headings:my-2 prose-h1:my-3 prose-h2:my-2 prose-h3:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-pre:my-2">
                <EditorContent editor={editor} data-placeholder="可以在这里记录会议过程你的笔记，支持markdown格式" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveRecord;


