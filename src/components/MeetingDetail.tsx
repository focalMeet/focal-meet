import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Edit3, 
  Save,
  RefreshCw,
  Clock,
  Users,
  Calendar,
  Sparkles,
  FileText,
  CheckSquare,
  MessageSquare
} from 'lucide-react';
import { 
  getPublicSession, 
  getSession, 
  SessionItem, 
  enrichNote, 
  generateNote, 
  getTask, 
  shareSession, 
  listNotes, 
  NoteRead,
  getEnhancedSession,
  SessionEnhanced,
  getSessionSections,
  SmartNotesResponse
} from '../lib/api';
import SmartNotesGeneration from './SmartNotesGeneration';

interface MeetingDetailProps {
  meetingId: string;
  onBack: () => void;
}

const MeetingDetail: React.FC<MeetingDetailProps> = ({ meetingId, onBack }) => {
  const [activeSection, setActiveSection] = useState<'summary' | 'smart_notes' | 'sections' | 'transcript'>('summary');
  const [manualNotes, setManualNotes] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [session, setSession] = useState<SessionItem | null>(null);
  const [enhancedSession, setEnhancedSession] = useState<SessionEnhanced | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<NoteRead | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [smartNotes, setSmartNotes] = useState<SmartNotesResponse | null>(null);
  const [sections, setSections] = useState<any>(null);

  // Mock data (summary/actions/transcript) for now; session header will be live
  const meetingData = {
    title: 'Product Planning Meeting',
    date: '2024-01-15',
    duration: '45 minutes',
    participants: ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Lisa Wang'],
    summary: `This meeting focused on Q1 product planning core agenda items. The meeting established three key feature development priorities:

1. **User Experience Optimization** - Addressing current user feedback on interface complexity, planning to complete UI/UX restructuring by end of February
2. **Performance Enhancement** - Resolving system response speed issues, targeting 50% reduction in page load times
3. **New Feature Development** - Based on market research results, prioritizing AI intelligent recommendation feature development

The meeting also discussed resource allocation and timeline scheduling to ensure all projects can be delivered on time.`,
    
    actionItems: [
      {
        id: '1',
        task: 'Complete UI/UX design mockups',
        assignee: 'John Smith',
        deadline: '2024-01-25',
        priority: 'high',
        status: 'pending'
      },
      {
        id: '2',
        task: 'Performance optimization technical assessment',
        assignee: 'Sarah Johnson',
        deadline: '2024-01-30',
        priority: 'medium',
        status: 'in-progress'
      },
      {
        id: '3',
        task: 'AI recommendation algorithm prototype development',
        assignee: 'Mike Chen',
        deadline: '2024-02-15',
        priority: 'high',
        status: 'pending'
      }
    ],
    
    transcript: `[00:00:12] John Smith: Hello everyone, today we're discussing Q1 product planning. First, I'd like to hear everyone's thoughts on current user feedback.

[00:00:28] Sarah Johnson: From the data perspective, users mainly report high interface complexity, and the learning curve for new users is quite steep. We need to consider simplifying the operation flow.

[00:00:45] Mike Chen: I agree with Sarah's point. Additionally, our system response speed needs optimization, especially during peak hours.

[00:01:02] Lisa Wang: Regarding new features, our market research shows strong user demand for AI intelligent recommendation functionality.

[00:01:18] John Smith: Great, let's discuss these issues one by one. First, UI/UX optimization...

[00:02:30] Sarah Johnson: I suggest we adopt a progressive approach to interface restructuring, avoiding too much change shock for users.

[00:03:15] Mike Chen: For performance optimization, we can start from caching strategy and database query optimization.

[00:04:20] Lisa Wang: For AI recommendation features, we need to collect more user behavior data to train the model first.

[00:05:30] John Smith: Excellent, let's determine specific timeline and responsible persons...`
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try to get enhanced session first
        try {
          const enhancedS = await getEnhancedSession(meetingId);
          if (!cancelled) {
            setEnhancedSession(enhancedS);
            // Convert to basic session format for compatibility
            setSession({
              id: enhancedS.id,
              title: enhancedS.title,
              status: enhancedS.status,
              created_at: enhancedS.created_at,
              updated_at: enhancedS.updated_at
            });
          }
        } catch (enhancedError) {
          // Fallback to basic session
          try {
            const s = await getSession(meetingId);
            if (!cancelled) setSession(s);
          } catch (e) {
            const ps = await getPublicSession(meetingId);
            if (!cancelled) setSession(ps);
          }
        }

        // Load sections if available
        try {
          const sectionsData = await getSessionSections(meetingId);
          if (!cancelled) setSections(sectionsData);
        } catch {
          // Sections may not exist yet
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to load session');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (meetingId) load();
    return () => { cancelled = true; };
  }, [meetingId]);

  useEffect(() => {
    let cancelled = false;
    const loadNote = async () => {
      if (!session) return;
      try {
        const notes = await listNotes();
        const found = notes.find(n => n.session_id === session.id);
        if (!cancelled) setNote(found || null);
      } catch {
        if (!cancelled) setNote(null);
      }
    };
    loadNote();
    return () => { cancelled = true; };
  }, [session]);

  const templates = [
    { id: '', name: 'Select Template' },
    { id: '1', name: 'Interview Template' },
    { id: '2', name: 'Product Review' },
    { id: '3', name: 'Customer Interview' }
  ];

  const handleRegenerateWithNotes = async () => {
    setIsRegenerating(true);
    try {
      if (!session) return;
      const { taskId } = await enrichNote({ sessionId: session.id });
      // Simple polling
      for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const t = await getTask(taskId);
        if (t.status === 'completed' || t.status === 'failed') break;
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return;
    setIsRegenerating(true);
    try {
      if (!session) return;
      const { taskId } = await generateNote({ sessionId: session.id, templateId: selectedTemplate });
      for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const t = await getTask(taskId);
        if (t.status === 'completed' || t.status === 'failed') break;
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleShare = async () => {
    try {
      if (!session) return;
      const res = await shareSession(session.id);
      setShareUrl(res.shareUrl);
    } catch {}
  };

  const handleSmartNotesGenerated = (notes: SmartNotesResponse) => {
    setSmartNotes(notes);
    // Switch to sections view to show the generated content
    setActiveSection('sections');
    // Refresh sections data
    loadSections();
  };

  const loadSections = async () => {
    try {
      const sectionsData = await getSessionSections(meetingId);
      setSections(sectionsData);
    } catch {
      // Sections may not exist yet
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'low': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'in-progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page-level heading and actions (moved from internal header) */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-4 p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-white">{session?.title || 'Meeting'}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {session ? new Date(session.created_at).toLocaleString() : '—'}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {session ? `Updated ${new Date(session.updated_at).toLocaleString()}` : '—'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-3 py-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button className="flex items-center px-3 py-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center text-gray-400 py-12">Loading...</div>
        )}
        {error && !loading && (
          <div className="text-center text-red-400 py-12">{error}</div>
        )}
        {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Navigation Tabs */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="border-b border-white/10">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveSection('summary')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeSection === 'summary'
                        ? 'border-red-500 text-red-400'
                        : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      概览
                    </div>
                  </button>
                  {enhancedSession && (
                    <button
                      onClick={() => setActiveSection('smart_notes')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeSection === 'smart_notes'
                          ? 'border-red-500 text-red-400'
                          : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center">
                        <Sparkles className="w-4 h-4 mr-2" />
                        智能笔记生成
                        {enhancedSession.enrichment_status === 'processing' && (
                          <RefreshCw className="w-3 h-3 ml-1 animate-spin" />
                        )}
                      </div>
                    </button>
                  )}
                  {sections && sections.sections.length > 0 && (
                    <button
                      onClick={() => setActiveSection('sections')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeSection === 'sections'
                          ? 'border-red-500 text-red-400'
                          : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center">
                        <CheckSquare className="w-4 h-4 mr-2" />
                        结构化笔记 ({sections.sections.length})
                      </div>
                    </button>
                  )}
                  <button
                    onClick={() => setActiveSection('transcript')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeSection === 'transcript'
                        ? 'border-red-500 text-red-400'
                        : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      转写稿
                    </div>
                  </button>
                </nav>
              </div>

              {/* Content Sections */}
              <div className="p-6">
                {activeSection === 'summary' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">会话概览</h3>
                    
                    {enhancedSession && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="text-sm text-gray-400">会话状态</div>
                          <div className="text-lg font-medium text-white">
                            {enhancedSession.status === 'enriched' ? '已智能化' :
                             enhancedSession.status === 'ready' ? '已就绪' :
                             enhancedSession.status === 'processing' ? '处理中' : enhancedSession.status}
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="text-sm text-gray-400">智能笔记状态</div>
                          <div className="text-lg font-medium text-white">
                            {enhancedSession.enrichment_status === 'completed' ? '已完成' :
                             enhancedSession.enrichment_status === 'processing' ? '生成中' :
                             enhancedSession.enrichment_status === 'failed' ? '失败' : '待生成'}
                          </div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="text-sm text-gray-400">内容统计</div>
                          <div className="text-lg font-medium text-white">
                            {enhancedSession.sections_count} 个段落
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>{enhancedSession?.has_transcript ? '✓ 有转写稿' : '○ 无转写稿'}</span>
                        <span>{enhancedSession?.has_user_notes ? '✓ 有用户笔记' : '○ 无用户笔记'}</span>
                        {enhancedSession?.audio_source_type && (
                          <span>音频源: {
                            enhancedSession.audio_source_type === 'upload' ? '上传' :
                            enhancedSession.audio_source_type === 'url' ? 'URL' :
                            enhancedSession.audio_source_type === 'realtime' ? '实时录制' :
                            enhancedSession.audio_source_type
                          }</span>
                        )}
                        {enhancedSession?.audio_duration && (
                          <span>时长: {Math.floor(enhancedSession.audio_duration / 60)}:{(enhancedSession.audio_duration % 60).toString().padStart(2, '0')}</span>
                        )}
                      </div>
                      
                      {enhancedSession?.final_markdown_preview && (
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="text-sm text-gray-400 mb-2">智能笔记预览:</div>
                          <div className="text-gray-300 whitespace-pre-line">
                            {enhancedSession.final_markdown_preview}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeSection === 'smart_notes' && enhancedSession && (
                  <SmartNotesGeneration 
                    session={enhancedSession}
                    onNotesGenerated={handleSmartNotesGenerated}
                  />
                )}

                {activeSection === 'sections' && sections && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">
                        结构化笔记 ({sections.sections.length} 个段落)
                      </h3>
                      <div className="text-sm text-gray-400">
                        生成模式: {sections.generation_type === 'enrich' ? 'Enrich' : 
                                 sections.generation_type === 'generate' ? 'Generate' : '未知'}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {sections.sections.map((section: any, index: number) => (
                        <div key={section.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className={`font-medium text-white ${
                              section.title_level === 1 ? 'text-xl' :
                              section.title_level === 2 ? 'text-lg' :
                              section.title_level === 3 ? 'text-base' : 'text-sm'
                            }`}>
                              {section.title_text}
                            </h4>
                            <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded">
                              段落 {section.section_order}
                            </span>
                          </div>
                          
                          {section.points && Array.isArray(section.points) && (
                            <div className="space-y-2">
                              {section.points.map((point: any, pointIndex: number) => (
                                <div key={pointIndex} className="text-sm text-gray-300 pl-4 border-l border-gray-600">
                                  {typeof point === 'string' ? point : 
                                   point.content || point.text || JSON.stringify(point)}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {section.points && !Array.isArray(section.points) && (
                            <div className="text-sm text-gray-300">
                              {typeof section.points === 'string' ? section.points : JSON.stringify(section.points)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === 'transcript' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">转写稿</h3>
                    <div className="bg-white/5 rounded-lg p-4 font-mono text-sm leading-relaxed whitespace-pre-line text-gray-300 border border-white/10">
                      {(note?.content?.transcript as any) || meetingData.transcript}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Manual Notes */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Manual Notes
                </h3>
                <button
                  onClick={handleRegenerateWithNotes}
                  disabled={!manualNotes.trim() || isRegenerating}
                  className="flex items-center px-3 py-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-md hover:from-teal-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isRegenerating ? (
                    <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-1" />
                  )}
                  Merge Analysis
                </button>
              </div>
              <textarea
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                placeholder="Record your thoughts and key insights here..."
                className="w-full h-32 p-3 bg-white/5 border border-white/10 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-sm text-white placeholder-gray-400"
              />
              <p className="mt-2 text-xs text-gray-400">
                After adding your notes, click "Merge Analysis" to let AI combine your insights and regenerate a more in-depth summary
              </p>
            </div>

            {/* Meeting Info */}
            <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Meeting Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-400">Participants</label>
                  <div className="mt-1">
                    {(note?.content?.participants as any as string[] | undefined)?.map((p, i) => (
                      <span key={i} className="inline-block bg-white/10 text-gray-300 text-xs px-2 py-1 rounded-full mr-2 mb-1 border border-white/20">{p}</span>
                    )) || null}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Duration</label>
                  <p className="text-sm text-white">{(note?.content as any)?.duration || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Created</label>
                  <p className="text-sm text-white">{session ? new Date(session.created_at).toLocaleString() : '—'}</p>
                </div>
                {shareUrl && (
                  <div className="text-xs text-gray-400 break-all">Share URL: {shareUrl}</div>
                )}
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default MeetingDetail;