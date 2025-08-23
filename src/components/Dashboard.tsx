import React, { useEffect, useMemo, useState } from 'react';
import {
  Mic,
  Upload,
  FileText,
  Clock,
  Users,
  Calendar,
  Search,
  Filter,
  MoreVertical,
  TrendingUp,
  Activity,
  Zap,
} from 'lucide-react';

import { listSessions, SessionItem } from '../lib/api';
import { isAuthenticated } from '../lib/auth';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {}

type Meeting = SessionItem & { duration?: string; participants?: number; type?: 'real-time' | 'uploaded' };

const Dashboard: React.FC<DashboardProps> = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listSessions();
      setMeetings(data);
    } catch (e: any) {
      // 提供更友好的错误信息
      let errorMessage = 'Failed to load sessions';
      if (e?.status === 403) {
        errorMessage = '权限不足，请重新登录';
      } else if (e?.status === 401) {
        errorMessage = '登录已过期，请重新登录';
      } else if (e?.message) {
        errorMessage = e.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/app/login');
      return;
    }
    fetchSessions();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'processing':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'draft':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return 'Processing';
      case 'draft':
        return 'Draft';
      default:
        return 'Unknown';
    }
  };

  const filteredMeetings = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return meetings;
    return meetings.filter(
      (m) => m.title?.toLowerCase().includes(term) || m.id.toLowerCase().includes(term)
    );
  }, [searchTerm, meetings]);

  const handleClickMeeting = (id: string) => {
    navigate(`/app/meetings/${id}`);
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Welcome Back, Start Your AI Meeting Journey</h2>
            <p className="text-gray-400 text-lg">Let AI create value for every meeting</p>
          </div>

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
              onClick={() => navigate('/app/upload')}
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
              {!loading && !error &&
                filteredMeetings.map((meeting) => (
                  <button
                    key={meeting.id}
                    onClick={() => handleClickMeeting(meeting.id)}
                    className="w-full text-left px-6 py-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-sm font-medium text-white">{meeting.title || 'Untitled Session'}</h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                              meeting.status
                            )}`}
                          >
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
      </div>
    </div>
  );
};

export default Dashboard;
