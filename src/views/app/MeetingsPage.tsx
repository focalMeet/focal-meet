import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  Upload as UploadIcon, 
  Link2, 
  Search, 
  Calendar, 
  Clock, 
  MoreVertical,
  Sparkles,
  FileText,
  Brain,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Filter
} from 'lucide-react';
import { 
  createSession, 
  listSessions, 
  SessionItem, 
  uploadSessionAudioFromUrl, 
  uploadSessionAudio,
  getEnhancedSessions,
  searchSessions,
  getSessionStatistics,
  SessionEnhanced,
  SessionsListResponse
} from '../../lib/api';
import { isAuthenticated } from '../../lib/auth';

type Meeting = SessionItem;

const MeetingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [meetings, setMeetings] = React.useState<Meeting[]>([]);
  const [enhancedSessions, setEnhancedSessions] = React.useState<SessionEnhanced[]>([]);
  const [statistics, setStatistics] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [useEnhancedView, setUseEnhancedView] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<string>('');
  const [enrichmentFilter, setEnrichmentFilter] = React.useState<string>('');
  const [showFilters, setShowFilters] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  // Mock card data for early UI preview
  const useMockCards = true;
  type MockCard = {
    id: string;
    title: string;
    tags: string[];
    duration: string; // e.g. '37:52'
    dateText: string; // e.g. '07-05 15:00'
    cover?: string; // optional image url
  };
  const mockCards: MockCard[] = [
    { id: 'm1', title: '张敏沟通2', tags: ['质量库', '标准型', '双离断', '逻辑回归', '自适应训练集', '不同场景数据'], duration: '37:52', dateText: '07-05 15:00' },
    { id: 'm2', title: '超级个体时代，如何发展人生…', tags: ['超级个体', '人生第二曲线', '劳动杠杆', '资本杠杆', '内容杠杆'], duration: '01:25:04', dateText: '06-18 23:58' },
    { id: 'm3', title: '钱江水利沟通—0616(2)', tags: ['数据资产', '交易', '腹背', '平台', '参数化', '智能化'], duration: '16:24', dateText: '06-17 09:31' },
    { id: 'm4', title: '国央企数字化转型的底层逻辑', tags: ['数字化转型', '业务价值', '数据驱动', '国央企', '业务场景'], duration: '17:16', dateText: '05-25 15:39' },
    { id: 'm5', title: 'Voice 250425_154559', tags: ['互联网', '连接', '信息化', 'AI', '产品经理'], duration: '31:15', dateText: '05-05 13:19' },
    { id: 'm6', title: '水务集团AI大模型智能化提…', tags: ['水务集团', 'AI大模型', '智能化升级', '数字化改造'], duration: '12:34', dateText: '06-18 22:48' },
    { id: 'm7', title: '20241022_164308', tags: ['南京浦口区', '化工厂', '机器人', '海康'], duration: '15:39', dateText: '2024-10-22 17:30' },
    { id: 'm8', title: '特别国债', tags: ['宏观', '财政', '债券'], duration: '23:10', dateText: '07-02 18:20' },
  ];

  const [showUrlModal, setShowUrlModal] = React.useState(false);
  const [urlValue, setUrlValue] = React.useState('');
  const [creatingFromUrl, setCreatingFromUrl] = React.useState(false);
  const [createMsg, setCreateMsg] = React.useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = React.useState(false);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadMsg, setUploadMsg] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!isAuthenticated()) navigate('/app/login');
  }, [navigate]);

  const fetchSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      if (useEnhancedView) {
        const data = await getEnhancedSessions({
          page,
          page_size: 20,
          status_filter: statusFilter || undefined,
          enrichment_status: enrichmentFilter || undefined
        });
        setEnhancedSessions(data.sessions);
        setStatistics(data.statistics);
        setTotalCount(data.total_count);
      } else {
      const data = await listSessions();
      setMeetings(data);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchSessions();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const searchRequest = {
        query: searchTerm,
        status: statusFilter ? [statusFilter] : undefined,
        enrichment_status: enrichmentFilter ? [enrichmentFilter] : undefined,
        page,
        page_size: 20
      };
      const data = await searchSessions(searchRequest);
      setEnhancedSessions(data.sessions);
      setStatistics(data.statistics);
      setTotalCount(data.total_count);
    } catch (e: any) {
      setError(e?.message || 'Failed to search sessions');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSessions();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enriched':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'ready':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'processing':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'recording':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'enriched':
        return '已智能化';
      case 'ready':
        return '已就绪';
      case 'processing':
        return '处理中';
      case 'recording':
        return '录制中';
      case 'pending':
        return '等待中';
      default:
        return status;
    }
  };

  const getEnrichmentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getEnrichmentStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'processing':
        return '生成中';
      case 'failed':
        return '失败';
      case 'pending':
        return '待生成';
      default:
        return status;
    }
  };

  const getGenerationTypeIcon = (type: string | null) => {
    switch (type) {
      case 'enrich':
        return <FileText className="w-4 h-4" />;
      case 'generate':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const getGenerationTypeText = (type: string | null) => {
    switch (type) {
      case 'enrich':
        return 'Enrich';
      case 'generate':
        return 'Generate';
      default:
        return '未生成';
    }
  };

  const filteredMeetings = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return meetings;
    return meetings.filter((m) => m.title?.toLowerCase().includes(term) || m.id.toLowerCase().includes(term));
  }, [searchTerm, meetings]);

  const filteredMockCards: MockCard[] = React.useMemo(() => {
    if (!useMockCards) return [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return mockCards;
    return mockCards.filter((c) =>
      c.title.toLowerCase().includes(term) || c.tags.some((t) => t.toLowerCase().includes(term))
    );
  }, [searchTerm]);

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
      setShowUrlModal(false);
      setUrlValue('');
    }
  };

  const handleUploadConfirm = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadMsg(null);
    try {
      const created = await createSession();
      await uploadSessionAudio(created.sessionId, selectedFile);
      setUploadMsg('Upload started. Processing...');
      navigate(`/app/meetings/${created.sessionId}`);
    } catch (err: any) {
      setUploadMsg(err?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
      setShowUploadModal(false);
      setSelectedFile(null);
    }
  };

  const handleSelectFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFilesChosen: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    // 直接复用上传页行为：选择即上传
    await handleUploadConfirm();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClickMeeting = (id: string) => {
    navigate(`/app/meetings/${id}`);
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <main className="relative w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Meetings</h1>
          </div> */}

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
              onClick={() => setShowUploadModal(true)}
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
              onClick={() => setShowUrlModal(true)}
              className="group relative bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 backdrop-blur-sm rounded-2xl p-6 border border-indigo-500/20 cursor-pointer hover:from-indigo-500/20 hover:to-indigo-600/20 hover:border-indigo-500/40 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/25"
            >
              <div className="flex items-center">
                <div className="p-3 bg-indigo-500/20 rounded-xl mr-4 group-hover:bg-indigo-500/30 transition-colors">
                  <Link2 className="w-7 h-7 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">URL</h3>
                  <p className="text-indigo-200/80 text-sm">Import audio from a URL</p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Overview */}
          {statistics && useEnhancedView && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-500/20 rounded-lg mr-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">{statistics.total_sessions}</div>
                    <div className="text-sm text-gray-400">总会话数</div>
                  </div>
                </div>
              </div>
              <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-emerald-500/20 rounded-lg mr-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">{statistics.enriched_sessions}</div>
                    <div className="text-sm text-gray-400">已智能化</div>
                  </div>
                </div>
              </div>
              <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-500/20 rounded-lg mr-3">
                    <RefreshCw className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">{statistics.pending_sessions}</div>
                    <div className="text-sm text-gray-400">待处理</div>
                  </div>
                </div>
              </div>
              <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-red-500/20 rounded-lg mr-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">{statistics.failed_sessions}</div>
                    <div className="text-sm text-gray-400">失败</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
            <div className="px-6 py-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  会议列表 
                  {useEnhancedView && totalCount > 0 && (
                    <span className="text-sm text-gray-400 ml-2">({totalCount} 个)</span>
                  )}
                </h2>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="搜索会议..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                    />
                  </div>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2 rounded-lg transition-colors ${
                      showFilters ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setUseEnhancedView(!useEnhancedView)}
                    className="px-3 py-2 text-sm bg-white/5 text-gray-400 hover:text-white transition-colors rounded-lg border border-white/10"
                  >
                    {useEnhancedView ? '基础视图' : '增强视图'}
                  </button>
                </div>
              </div>
              
              {/* Filters */}
              {showFilters && useEnhancedView && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">会话状态</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    >
                      <option value="">全部状态</option>
                      <option value="pending">等待中</option>
                      <option value="recording">录制中</option>
                      <option value="processing">处理中</option>
                      <option value="ready">已就绪</option>
                      <option value="enriched">已智能化</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">智能笔记状态</label>
                    <select
                      value={enrichmentFilter}
                      onChange={(e) => setEnrichmentFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    >
                      <option value="">全部</option>
                      <option value="pending">待生成</option>
                      <option value="processing">生成中</option>
                      <option value="completed">已完成</option>
                      <option value="failed">失败</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={searchTerm ? handleSearch : fetchSessions}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm"
                    >
                      应用筛选
                    </button>
                  </div>
                </div>
              )}
            </div>
            {useMockCards ? (
              <div className="p-6">
                {filteredMockCards.length === 0 && (
                  <div className="py-16 text-center text-gray-400">No mock meetings</div>
                )}
                <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-6">
                  {filteredMockCards.map((card) => (
                    <div
                      key={card.id}
                      className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer"
                      onClick={() => navigate(`/app/meetings/${card.id}`)}
                    >
                      <div className="p-4 pb-0">
                        <h3 className="text-sm font-semibold text-white line-clamp-2 min-h-[2.5rem]">{card.title}</h3>
                        <div className="mt-2 flex flex-wrap gap-2 min-h-[2.25rem]">
                          {card.tags.slice(0, 8).map((t, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md text-[11px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 mx-4 rounded-lg overflow-hidden border border-white/10 bg-gradient-to-br from-gray-800 to-gray-900 aspect-[16/9] flex items-center justify-center">
                        <div className="text-gray-500 text-xs">Preview</div>
                      </div>
                      <div className="p-4 flex items-center justify-between text-xs text-gray-400">
                        <span>{card.duration}</span>
                        <span>{card.dateText}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {loading && (
                  <div className="px-6 py-8 text-center text-gray-400">加载中...</div>
                )}
                {error && !loading && (
                  <div className="px-6 py-8 text-center text-red-400">{error}</div>
                )}
                {!loading && !error && !useEnhancedView && filteredMeetings.length === 0 && (
                  <div className="px-6 py-8 text-center text-gray-400">没有找到会话</div>
                )}
                {!loading && !error && useEnhancedView && enhancedSessions.length === 0 && (
                  <div className="px-6 py-8 text-center text-gray-400">没有找到会话</div>
                )}
                
                {/* Enhanced Sessions View */}
                {!loading && !error && useEnhancedView &&
                  enhancedSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => handleClickMeeting(session.id)}
                      className="w-full text-left px-6 py-4 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-sm font-medium text-white">{session.title || '无标题会话'}</h3>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                                session.status
                              )}`}
                            >
                              {getStatusText(session.status)}
                            </span>
                            {session.enrichment_status !== 'pending' && (
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEnrichmentStatusColor(
                                  session.enrichment_status
                                )}`}
                              >
                                {getGenerationTypeIcon(session.generation_type)}
                                <span className="ml-1">{getEnrichmentStatusText(session.enrichment_status)}</span>
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(session.created_at).toLocaleString()}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {session.updated_at ? `更新于 ${new Date(session.updated_at).toLocaleString()}` : '—'}
                            </span>
                            {session.audio_duration && (
                              <span className="flex items-center">
                                <Mic className="w-4 h-4 mr-1" />
                                {Math.floor(session.audio_duration / 60)}:{(session.audio_duration % 60).toString().padStart(2, '0')}
                              </span>
                            )}
                          </div>
                          
                          {/* Session Details */}
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{session.has_transcript ? '✓ 转写稿' : '○ 无转写稿'}</span>
                            <span>{session.has_user_notes ? '✓ 用户笔记' : '○ 无用户笔记'}</span>
                            {session.sections_count > 0 && (
                              <span>{session.sections_count} 个段落</span>
                            )}
                            {session.audio_source_type && (
                              <span>
                                来源: {session.audio_source_type === 'upload' ? '上传' : 
                                      session.audio_source_type === 'url' ? 'URL' : 
                                      session.audio_source_type === 'realtime' ? '实时录制' : session.audio_source_type}
                              </span>
                            )}
                          </div>
                          
                          {/* Preview */}
                          {session.final_markdown_preview && (
                            <div className="mt-2 p-2 bg-white/5 rounded text-xs text-gray-300 line-clamp-2">
                              {session.final_markdown_preview}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {session.generation_type && (
                            <span className="flex items-center text-xs text-gray-400 bg-white/5 px-2 py-1 rounded">
                              {getGenerationTypeIcon(session.generation_type)}
                              <span className="ml-1">{getGenerationTypeText(session.generation_type)}</span>
                            </span>
                          )}
                          <span className="p-2 text-gray-400 rounded-lg bg-white/5">
                            <MoreVertical className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                  
                {/* Basic Sessions View */}
                {!loading && !error && !useEnhancedView &&
                  filteredMeetings.map((meeting) => (
                    <button
                      key={meeting.id}
                      onClick={() => handleClickMeeting(meeting.id)}
                      className="w-full text-left px-6 py-4 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-sm font-medium text-white">{meeting.title || '无标题会话'}</h3>
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
                              {meeting.updated_at ? `更新于 ${new Date(meeting.updated_at).toLocaleString()}` : '—'}
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
            )}
          </div>
          {/* URL Modal */}
          {showUrlModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60" onClick={() => setShowUrlModal(false)} />
              <div className="relative z-10 w-full max-w-2xl rounded-xl border border-white/10 bg-gray-900 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">输入播客 RSS 订阅链接</h3>
                  <button onClick={() => setShowUrlModal(false)} className="text-gray-400 hover:text-white">✕</button>
                </div>
                <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  <div className="text-center">
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-12 bg-white/5">
                      <div className="space-y-4 max-w-xl mx-auto">
                        <Link2 className="w-12 h-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-lg font-medium text-white">输入音频/播客链接</p>
                          <p className="text-sm text-gray-400">支持 RSS/直链</p>
                        </div>
                        <input
                          type="text"
                          placeholder="https://..."
                          value={urlValue}
                          onChange={(e) => setUrlValue(e.target.value)}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                        />
                        <div className="text-xs text-gray-500">由于服务条款限制，无法直接解析部分平台（优酷/抖音/爱奇艺/腾讯视频/哔哩哔哩等）；可先下载再上传。</div>
                        <div className="flex justify-center space-x-2">
                          <button onClick={() => setShowUrlModal(false)} className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 text-gray-200 text-sm">取消</button>
                          <button onClick={handleCreateFromUrl} disabled={creatingFromUrl || !urlValue.trim()} className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed">{creatingFromUrl ? '创建中...' : '开始解析'}</button>
                        </div>
                      </div>
                    </div>
                    {createMsg && (
                      <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10 text-sm text-gray-300">{createMsg}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upload Modal */}
          {showUploadModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/60" onClick={() => setShowUploadModal(false)} />
              <div className="relative z-10 w-full max-w-2xl rounded-xl border border-white/10 bg-gray-900 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">上传本地音视频文件</h3>
                  <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-white">✕</button>
                </div>
                <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  <div className="text-center">
                    <div
                      className="border-2 border-dashed border-white/20 rounded-xl p-12 hover:border-teal-400/50 transition-colors cursor-pointer bg-white/5 hover:bg-white/10"
                      onClick={handleSelectFiles}
                    >
                      <div className="space-y-4">
                        <UploadIcon className="w-12 h-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-lg font-medium text-white">拖拽文件到此</p>
                          <p className="text-sm text-gray-400">或点击选择文件</p>
                        </div>
                        <button
                          onClick={handleSelectFiles}
                          disabled={uploading}
                          className="px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          选择文件
                        </button>
                        <input ref={fileInputRef} type="file" accept="audio/*,video/*" className="hidden" onChange={handleFilesChosen} />
                      </div>
                    </div>
                    {uploadMsg && (
                      <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10 text-sm text-gray-300">{uploadMsg}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MeetingsPage;


