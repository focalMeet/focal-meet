import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Upload as UploadIcon, Link2, Search, Calendar, Clock, MoreVertical } from 'lucide-react';
import { createSession, listSessions, SessionItem, uploadSessionAudioFromUrl } from '../../lib/api';
import { isAuthenticated } from '../../lib/auth';

type Meeting = SessionItem;

const MeetingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [meetings, setMeetings] = React.useState<Meeting[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [urlOpen, setUrlOpen] = React.useState(false);
  const [urlValue, setUrlValue] = React.useState('');
  const [creatingFromUrl, setCreatingFromUrl] = React.useState(false);
  const [createMsg, setCreateMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isAuthenticated()) navigate('/app/login');
  }, [navigate]);

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

  React.useEffect(() => {
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

  const filteredMeetings = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return meetings;
    return meetings.filter((m) => m.title?.toLowerCase().includes(term) || m.id.toLowerCase().includes(term));
  }, [searchTerm, meetings]);

  const handleCreateFromUrl = async () => {
    const url = urlValue.trim();
    if (!url) return;
    setCreatingFromUrl(true);
    setCreateMsg(null);
    try {
      const created = await createSession();
      await uploadSessionAudioFromUrl(created.sessionId, url);
      setCreateMsg('Audio import started. Processing...');
      navigate(`/app/meetings/${created.sessionId}`);
    } catch (err: any) {
      setCreateMsg(err?.message || 'Failed to import from URL');
    } finally {
      setCreatingFromUrl(false);
      setUrlOpen(false);
      setUrlValue('');
    }
  };

  const handleClickMeeting = (id: string) => {
    navigate(`/app/meetings/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Meetings</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => navigate('/app/live')}
              className="group relative bg-gradient-to-br from-red-500/10 to-red-600/10 backdrop-blur-sm rounded-2xl p-6 border border-red-500/20 cursor-pointer hover:from-red-500/20 hover:to-red-600/20 hover:border-red-500/40 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-500/25"
            >
              <div className="flex items-center">
                <div className="p-3 bg-red-500/20 rounded-xl mr-4 group-hover:bg-red-500/30 transition-colors">
                  <Mic className="w-7 h-7 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">LIVE</h3>
                  <p className="text-red-200/80 text-sm">Start recording and get real-time notes</p>
                </div>
              </div>
            </div>

            <div
              onClick={() => navigate('/app/upload')}
              className="group relative bg-gradient-to-br from-teal-500/10 to-teal-600/10 backdrop-blur-sm rounded-2xl p-6 border border-teal-500/20 cursor-pointer hover:from-teal-500/20 hover:to-teal-600/20 hover:border-teal-500/40 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-teal-500/25"
            >
              <div className="flex items-center">
                <div className="p-3 bg-teal-500/20 rounded-xl mr-4 group-hover:bg-teal-500/30 transition-colors">
                  <UploadIcon className="w-7 h-7 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">UPLOAD</h3>
                  <p className="text-teal-200/80 text-sm">Upload audio files to process</p>
                </div>
              </div>
            </div>

            <div
              className="group relative bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 backdrop-blur-sm rounded-2xl p-6 border border-indigo-500/20 hover:from-indigo-500/20 hover:to-indigo-600/20 hover:border-indigo-500/40 transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-3 bg-indigo-500/20 rounded-xl mr-4 group-hover:bg-indigo-500/30 transition-colors">
                    <Link2 className="w-7 h-7 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">URL</h3>
                    <p className="text-indigo-200/80 text-sm">Import audio from a URL</p>
                  </div>
                </div>
                <button
                  onClick={() => setUrlOpen((v) => !v)}
                  className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-md text-gray-200"
                >
                  {urlOpen ? 'Cancel' : 'Use URL'}
                </button>
              </div>
              {urlOpen && (
                <div className="mt-4 flex items-center space-x-2">
                  <input
                    type="url"
                    placeholder="https://... audio url"
                    value={urlValue}
                    onChange={(e) => setUrlValue(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                  />
                  <button
                    onClick={handleCreateFromUrl}
                    disabled={creatingFromUrl || !urlValue.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-md hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {creatingFromUrl ? 'Creating...' : 'Create'}
                  </button>
                </div>
              )}
              {createMsg && (
                <div className="mt-2 text-xs text-gray-300">{createMsg}</div>
              )}
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
            <div className="px-6 py-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Meeting List</h2>
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
      </main>
    </div>
  );
};

export default MeetingsPage;


