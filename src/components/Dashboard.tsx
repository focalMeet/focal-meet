import React, { useEffect, useMemo, useRef, useState } from 'react';
import { 
  Mic, 
  Upload, 
  FileText, 
  Plus,
  Clock,
  Users,
  Calendar,
  Search,
  Filter,
  MoreVertical,
  Play,
  Pause,
  Square,
  Edit3,
  Trash2,
  TrendingUp,
  Activity,
  Zap
} from 'lucide-react';

import { createSession, listSessions, SessionItem, uploadSessionAudio, listTemplates as apiListTemplates, createTemplate as apiCreateTemplate, updateTemplate as apiUpdateTemplate, deleteTemplate as apiDeleteTemplate, TemplateRead } from '../lib/api';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {}

type Meeting = SessionItem & { duration?: string; participants?: number; type?: 'real-time' | 'uploaded' };

const Dashboard: React.FC<DashboardProps> = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'record' | 'upload' | 'templates'>('dashboard');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const [partialText, setPartialText] = useState('');
  const [finalLines, setFinalLines] = useState<string[]>([]);
  const [wsStatus, setWsStatus] = useState<'idle' | 'connecting' | 'ready' | 'closed' | 'error'>('idle');
  const [totalBytes, setTotalBytes] = useState(0);
  const [inputText, setInputText] = useState('');
  const [inputLogs, setInputLogs] = useState<{ ts: number; text: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listSessions();
      setMeetings(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'dashboard') fetchSessions();
  }, [activeTab]);

  const [templates, setTemplates] = useState<TemplateRead[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [newTplName, setNewTplName] = useState('');
  const [newTplPrompt, setNewTplPrompt] = useState('');
  const [savingTemplateId, setSavingTemplateId] = useState<string | null>(null);

  const fetchTemplates = async () => {
    setTemplatesLoading(true);
    setTemplatesError(null);
    try {
      const data = await apiListTemplates();
      setTemplates(data);
    } catch (e: any) {
      setTemplatesError(e?.message || 'Failed to load templates');
    } finally {
      setTemplatesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'templates') fetchTemplates();
  }, [activeTab]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // Start recording timer
    const timer = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    
    // Store timer reference for cleanup
    (window as any).recordingTimer = timer;
    startStreaming();
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setRecordingTime(0);
    if ((window as any).recordingTimer) {
      clearInterval((window as any).recordingTimer);
    }
    stopStreaming();
  };

  const handlePauseRecording = () => {
    if (!isStreaming) return;
    // Toggle processor connection to pause/resume sending, keep socket open
    const processor = processorRef.current;
    const source = sourceNodeRef.current;
    if (processor && source) {
      if (processor.numberOfOutputs >= 0) {
        try { source.disconnect(processor); } catch {}
        try { processor.disconnect(); } catch {}
        setIsStreaming(false);
      }
    }
  };

  const resumeStreaming = () => {
    if (!audioContextRef.current || !mediaStreamRef.current) return;
    const ctx = audioContextRef.current;
    const stream = mediaStreamRef.current;
    const source = ctx.createMediaStreamSource(stream);
    const processor = ctx.createScriptProcessor(4096, 1, 1);
    processor.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      const pcm16 = floatTo16BitPCM(downsampleBuffer(input, ctx.sampleRate, 16000));
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(pcm16.buffer);
      }
    };
    source.connect(processor);
    processor.connect(ctx.destination);
    sourceNodeRef.current = source;
    processorRef.current = processor;
    setIsStreaming(true);
  };

  const startStreaming = async () => {
    setPartialText('');
    setFinalLines([]);
    setTotalBytes(0);
    setWsStatus('connecting');
    const url = (import.meta as any).env?.VITE_WS_URL || `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/api/ws/transcribe`;
    const ws = new WebSocket(url);
    wsRef.current = ws;
    ws.onopen = async () => {
      setWsStatus('ready');
      ws.send(JSON.stringify({ type: 'start', format: 'pcm16', sample_rate: 16000 }));
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = ctx;
        // initial connect
        resumeStreaming();
      } catch (err) {
        setWsStatus('error');
      }
    };
    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'ack' && msg.event === 'chunk') {
          setTotalBytes(msg.totalBytes || 0);
        } else if (msg.type === 'partial') {
          setPartialText(msg.text || '');
        } else if (msg.type === 'final') {
          setPartialText('');
          setFinalLines(prev => [...prev, msg.text || '']);
        }
      } catch {
        // ignore non-JSON
      }
    };
    ws.onclose = () => {
      setWsStatus('closed');
    };
    ws.onerror = () => {
      setWsStatus('error');
    };
  };

  const stopStreaming = () => {
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'stop' }));
      }
    } catch {}
    try {
      wsRef.current?.close();
    } catch {}
    wsRef.current = null;
    setWsStatus('closed');
    setIsStreaming(false);
    try {
      processorRef.current?.disconnect();
      sourceNodeRef.current?.disconnect();
    } catch {}
    processorRef.current = null;
    sourceNodeRef.current = null;
    try {
      audioContextRef.current?.close();
    } catch {}
    audioContextRef.current = null;
    mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    mediaStreamRef.current = null;
  };

  const downsampleBuffer = (buffer: Float32Array, sampleRate: number, outSampleRate: number): Float32Array => {
    if (outSampleRate === sampleRate) return buffer;
    const sampleRateRatio = sampleRate / outSampleRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Float32Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;
    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      let accum = 0;
      let count = 0;
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }
      result[offsetResult] = accum / (count || 1);
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    return result;
  };

  const floatTo16BitPCM = (input: Float32Array): Int16Array => {
    const buffer = new ArrayBuffer(input.length * 2);
    const view = new DataView(buffer);
    let offset = 0;
    for (let i = 0; i < input.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return new Int16Array(buffer);
  };

  const addInputLog = () => {
    const text = inputText.trim();
    if (!text) return;
    setInputLogs(prev => [...prev, { ts: Date.now(), text }]);
    setInputText('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'processing': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'draft': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'processing': return 'Processing';
      case 'draft': return 'Draft';
      default: return 'Unknown';
    }
  };

  const filteredMeetings = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return meetings;
    return meetings.filter(m => m.title?.toLowerCase().includes(term) || m.id.toLowerCase().includes(term));
  }, [searchTerm, meetings]);

  const handleClickMeeting = (id: string) => {
    navigate(`/app/meetings/${id}`);
  };

  const handleSelectFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFilesChosen: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMessage(null);
    try {
      const created = await createSession();
      await uploadSessionAudio(created.sessionId, file);
      setUploadMessage('Upload succeeded. Transcription started.');
      await fetchSessions();
      setActiveTab('dashboard');
    } catch (err: any) {
      setUploadMessage(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content: header/nav handled by AppLayout */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Welcome Back, Start Your AI Meeting Journey
              </h2>
              <p className="text-gray-400 text-lg">
                Let AI create value for every meeting
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div 
                onClick={() => navigate('/app/live')}
                className="group relative bg-gradient-to-br from-red-500/10 to-red-600/10 backdrop-blur-sm rounded-2xl p-8 border border-red-500/20 cursor-pointer hover:from-red-500/20 hover:to-red-600/20 hover:border-red-500/40 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-red-500/25"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-red-500/20 rounded-xl mr-4 group-hover:bg-red-500/30 transition-colors">
                        <Mic className="w-8 h-8 text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Start Live Meeting</h3>
                        <p className="text-red-200/80">Click to start recording and generate real-time minutes</p>
                      </div>
                    </div>
                  </div>
                  <div className="opacity-20 group-hover:opacity-40 transition-opacity">
                    <Zap className="w-16 h-16 text-red-400" />
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setActiveTab('upload')}
                className="group relative bg-gradient-to-br from-teal-500/10 to-teal-600/10 backdrop-blur-sm rounded-2xl p-8 border border-teal-500/20 cursor-pointer hover:from-teal-500/20 hover:to-teal-600/20 hover:border-teal-500/40 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal-500/25"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-teal-500/20 rounded-xl mr-4 group-hover:bg-teal-500/30 transition-colors">
                        <Upload className="w-8 h-8 text-teal-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">Upload Audio File</h3>
                        <p className="text-teal-200/80">Upload audio files to automatically generate minutes</p>
                      </div>
                    </div>
                  </div>
                  <div className="opacity-20 group-hover:opacity-40 transition-opacity">
                    <Activity className="w-16 h-16 text-teal-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-500/20 rounded-xl mr-4">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Meetings</p>
                    <p className="text-2xl font-bold text-white">24</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex items-center">
                  <div className="p-3 bg-emerald-500/20 rounded-xl mr-4">
                    <Clock className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Duration</p>
                    <p className="text-2xl font-bold text-white">18.5 hrs</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-500/20 rounded-xl mr-4">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">Participants</p>
                    <p className="text-2xl font-bold text-white">156</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-500/20 rounded-xl mr-4">
                    <TrendingUp className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">This Month</p>
                    <p className="text-2xl font-bold text-white">8</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Meetings */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="px-6 py-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Recent Meetings</h2>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search meetings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                      />
                    </div>
                    <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-white/10">
                {loading && (
                  <div className="px-6 py-8 text-center text-gray-400">Loading sessions...</div>
                )}
                {error && !loading && (
                  <div className="px-6 py-8 text-center text-red-400">{error}</div>
                )}
                {!loading && !error && filteredMeetings.length === 0 && (
                  <div className="px-6 py-8 text-center text-gray-400">No sessions found</div>
                )}
                {!loading && !error && filteredMeetings.map((meeting) => (
                  <button key={meeting.id} onClick={() => handleClickMeeting(meeting.id)} className="w-full text-left px-6 py-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-sm font-medium text-white">{meeting.title || 'Untitled Session'}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(meeting.status)}`}>
                            {getStatusText(meeting.status)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(meeting.created_at).toLocaleString()}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {meeting.updated_at ? `Updated ${new Date(meeting.updated_at).toLocaleString()}` : '—'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="p-2 text-gray-400 rounded-lg bg-white/5">
                          <MoreVertical className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Real-time Recording Tab */}
        {activeTab === 'record' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
              <div className="text-center">
                <div className="mb-8">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
                    isRecording ? 'bg-red-500/20 border-2 border-red-500/50' : 'bg-white/5 border-2 border-white/10'
                  } transition-all duration-300`}>
                    <Mic className={`w-12 h-12 ${isRecording ? 'text-red-400' : 'text-gray-400'} transition-colors`} />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Live Meeting Recording</h2>
                  <p className="text-gray-400">Click start to begin recording, the system will transcribe in real-time and generate minutes</p>
                </div>

                {isRecording && (
                  <div className="mb-8">
                    <div className="text-4xl font-mono font-bold text-red-400 mb-2">
                      {formatTime(recordingTime)}
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-red-400 font-medium">{wsStatus === 'ready' ? 'Streaming audio...' : wsStatus === 'connecting' ? 'Connecting...' : wsStatus}</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-400 text-center">Total sent: {totalBytes} bytes</div>
                  </div>
                )}

                <div className="flex items-center justify-center space-x-4">
                  {!isRecording ? (
                    <button
                      onClick={handleStartRecording}
                      className="flex items-center px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium transform hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/25"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start Recording
                    </button>
                  ) : (
                    <>
                      <button onClick={handlePauseRecording} className="flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200 font-medium">
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </button>
                      <button
                        onClick={handleStopRecording}
                        className="flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-medium"
                      >
                        <Square className="w-5 h-5 mr-2" />
                        Stop
                      </button>
                      {!isStreaming && (
                        <button onClick={resumeStreaming} className="flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 font-medium">
                          <Play className="w-5 h-5 mr-2" />
                          Resume
                        </button>
                      )}
                    </>
                  )}
                </div>

                {isRecording && (
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <h3 className="text-sm font-medium text-white mb-2">Real-time Transcription</h3>
                      <div className="text-sm text-gray-300 text-left whitespace-pre-wrap min-h-[120px]">
                        {finalLines.map((line, idx) => (
                          <div key={idx} className="mb-1">{line}</div>
                        ))}
                        {partialText && (
                          <div className="opacity-70">{partialText}</div>
                        )}
                      </div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <h3 className="text-sm font-medium text-white mb-2">Your Notes</h3>
                      <div className="flex items-stretch space-x-2">
                        <input value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addInputLog(); } }} placeholder="Type and press Enter..." className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50" />
                        <button onClick={addInputLog} className="px-3 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-md hover:from-teal-600 hover:to-teal-700 text-sm">Add</button>
                      </div>
                      <div className="mt-3 max-h-40 overflow-auto space-y-1 text-xs text-gray-300">
                        {inputLogs.map((log, i) => (
                          <div key={i} className="flex items-start"><span className="text-gray-500 mr-2">[{new Date(log.ts).toLocaleTimeString()}]</span><span>{log.text}</span></div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* File Upload Tab */}
        {activeTab === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
              <div className="text-center">
                <div className="mb-8">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-teal-500/20 border-2 border-teal-500/50 mb-6">
                    <Upload className="w-12 h-12 text-teal-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Upload Audio File</h2>
                  <p className="text-gray-400">Supports MP3, WAV, M4A formats, maximum file size 100MB</p>
                </div>

                <div className="border-2 border-dashed border-white/20 rounded-xl p-12 hover:border-teal-400/50 transition-colors cursor-pointer bg-white/5 hover:bg-white/10" onClick={handleSelectFiles}>
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-white">Drag files here</p>
                      <p className="text-sm text-gray-400">or click to select files</p>
                    </div>
                    <button onClick={handleSelectFiles} disabled={uploading} className="px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                      Select Files
                    </button>
                    <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleFilesChosen} />
                  </div>
                </div>

                <div className="mt-6 text-left">
                  <h3 className="text-sm font-medium text-white mb-3">Recent Uploads</h3>
                  <div className="space-y-2">
                    {uploading && (
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center">
                          <FileText className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-white">Uploading...</p>
                            <p className="text-xs text-gray-400">Starting transcription</p>
                          </div>
                        </div>
                        <div className="w-16 bg-white/10 rounded-full h-2">
                          <div className="bg-teal-500 h-2 rounded-full animate-pulse" style={{ width: '65%' }}></div>
                        </div>
                      </div>
                    )}
                    {uploadMessage && (
                      <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-sm text-gray-300">{uploadMessage}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Template Management</h2>
              <button onClick={() => setCreatingTemplate(v => !v)} className="flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200">
                <Plus className="w-4 h-4 mr-2" />
                {creatingTemplate ? 'Cancel' : 'Create Template'}
              </button>
            </div>

            {creatingTemplate && (
              <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="grid grid-cols-1 gap-4">
                  <input value={newTplName} onChange={(e) => setNewTplName(e.target.value)} placeholder="Template name" className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50" />
                  <textarea value={newTplPrompt} onChange={(e) => setNewTplPrompt(e.target.value)} placeholder="Prompt..." className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 h-28" />
                  <div>
                    <button disabled={!newTplName.trim() || !newTplPrompt.trim()} onClick={async () => {
                      try {
                        await apiCreateTemplate({ name: newTplName.trim(), prompt: newTplPrompt.trim() });
                        setNewTplName('');
                        setNewTplPrompt('');
                        setCreatingTemplate(false);
                        await fetchTemplates();
                      } catch (e) {
                        // silent error for now
                      }
                    }} className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed">Save</button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templatesLoading && (
                <div className="text-gray-400">Loading templates...</div>
              )}
              {templatesError && !templatesLoading && (
                <div className="text-red-400">{templatesError}</div>
              )}
              {!templatesLoading && !templatesError && templates.map((template) => (
                <div key={template.id} className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:border-white/20 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-full">
                      <input
                        defaultValue={template.name}
                        onChange={(e) => { (template as any).__name = e.target.value; }}
                        className="w-full mb-2 px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                      />
                      <textarea
                        defaultValue={template.prompt}
                        onChange={(e) => { (template as any).__prompt = e.target.value; }}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 h-24"
                      />
                    </div>
                    <button className="p-1 text-gray-400 hover:text-white transition-colors rounded hover:bg-white/5">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{template.is_system_template ? 'System' : 'Custom'}</span>
                    <div className="flex items-center space-x-2">
                      <button disabled={savingTemplateId === template.id} onClick={async () => {
                        try {
                          setSavingTemplateId(template.id);
                          await apiUpdateTemplate(template.id, { name: (template as any).__name ?? template.name, prompt: (template as any).__prompt ?? template.prompt });
                          await fetchTemplates();
                        } finally {
                          setSavingTemplateId(null);
                        }
                      }} className="p-2 text-gray-400 hover:text-white transition-colors rounded hover:bg-white/5 disabled:opacity-50">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {!template.is_system_template && (
                        <button onClick={async () => { await apiDeleteTemplate(template.id); await fetchTemplates(); }} className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded hover:bg-red-500/10">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;