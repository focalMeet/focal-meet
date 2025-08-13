import React, { useState } from 'react';
import { 
  Mic, 
  Upload, 
  FileText, 
  Settings, 
  LogOut, 
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
  Download,
  Edit3,
  Trash2,
  Sparkles,
  TrendingUp,
  Activity,
  Zap
} from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: string;
  participants: number;
  status: 'completed' | 'processing' | 'draft';
  type: 'real-time' | 'uploaded';
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'record' | 'upload' | 'templates'>('dashboard');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const recentMeetings: Meeting[] = [
    {
      id: '1',
      title: 'Product Planning Meeting',
      date: '2024-01-15',
      duration: '45 minutes',
      participants: 6,
      status: 'completed',
      type: 'real-time'
    },
    {
      id: '2',
      title: 'Customer Interview Recording',
      date: '2024-01-14',
      duration: '32 minutes',
      participants: 3,
      status: 'processing',
      type: 'uploaded'
    },
    {
      id: '3',
      title: 'Team Weekly Standup',
      date: '2024-01-12',
      duration: '28 minutes',
      participants: 8,
      status: 'completed',
      type: 'real-time'
    }
  ];

  const templates = [
    { id: '1', name: 'Interview Template', description: 'Structured interview minutes generation', usage: 12 },
    { id: '2', name: 'Product Review', description: 'Product feature discussion key points extraction', usage: 8 },
    { id: '3', name: 'Customer Interview', description: 'User needs and feedback organization', usage: 15 }
  ];

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
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setRecordingTime(0);
    if ((window as any).recordingTimer) {
      clearInterval((window as any).recordingTimer);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Sparkles className="w-8 h-8 text-red-400 mr-3" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-red-400 to-teal-400 bg-clip-text text-transparent">
                Focal Meet
              </h1>
            </div>
            
            <nav className="hidden md:flex space-x-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === 'dashboard' 
                    ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border border-red-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('record')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === 'record' 
                    ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border border-red-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Live Recording
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === 'upload' 
                    ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border border-red-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Upload Files
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === 'templates' 
                    ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border border-red-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                Templates
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={onLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 py-8">
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
                onClick={() => setActiveTab('record')}
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
                {recentMeetings.map((meeting) => (
                  <div key={meeting.id} className="px-6 py-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-sm font-medium text-white">{meeting.title}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(meeting.status)}`}>
                            {getStatusText(meeting.status)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {meeting.date}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {meeting.duration}
                          </span>
                          <span className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {meeting.participants} people
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
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
                      <span className="text-sm text-red-400 font-medium">Recording in progress...</span>
                    </div>
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
                      <button className="flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200 font-medium">
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
                    </>
                  )}
                </div>

                {isRecording && (
                  <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
                    <h3 className="text-sm font-medium text-white mb-2">Real-time Transcription Preview</h3>
                    <p className="text-sm text-gray-300 text-left">
                      Today we're discussing the main agenda for the next product version planning, including new feature prioritization and timeline scheduling...
                    </p>
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

                <div className="border-2 border-dashed border-white/20 rounded-xl p-12 hover:border-teal-400/50 transition-colors cursor-pointer bg-white/5 hover:bg-white/10">
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-white">Drag files here</p>
                      <p className="text-sm text-gray-400">or click to select files</p>
                    </div>
                    <button className="px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200">
                      Select Files
                    </button>
                  </div>
                </div>

                <div className="mt-6 text-left">
                  <h3 className="text-sm font-medium text-white mb-3">Recent Uploads</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-white">customer_interview_20240115.mp3</p>
                          <p className="text-xs text-gray-400">Processing... 65%</p>
                        </div>
                      </div>
                      <div className="w-16 bg-white/10 rounded-full h-2">
                        <div className="bg-teal-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </div>
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
              <button className="flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200">
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:border-white/20 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">{template.description}</p>
                    </div>
                    <button className="p-1 text-gray-400 hover:text-white transition-colors rounded hover:bg-white/5">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Used {template.usage} times</span>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-white transition-colors rounded hover:bg-white/5">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4" />
                      </button>
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