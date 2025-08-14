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
import { getPublicSession, getSession, SessionItem, enrichNote, generateNote, getTask, shareSession, listNotes, NoteRead } from '../lib/api';

interface MeetingDetailProps {
  meetingId: string;
  onBack: () => void;
}

const MeetingDetail: React.FC<MeetingDetailProps> = ({ meetingId, onBack }) => {
  const [activeSection, setActiveSection] = useState<'summary' | 'actions' | 'transcript'>('summary');
  const [manualNotes, setManualNotes] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [session, setSession] = useState<SessionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<NoteRead | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

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
        const s = await getSession(meetingId);
        if (!cancelled) setSession(s);
      } catch (e) {
        try {
          const ps = await getPublicSession(meetingId);
          if (!cancelled) setSession(ps);
        } catch (err: any) {
          if (!cancelled) setError(err?.message || 'Failed to load session');
        }
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
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
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
                      Meeting Summary
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveSection('actions')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeSection === 'actions'
                        ? 'border-red-500 text-red-400'
                        : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center">
                      <CheckSquare className="w-4 h-4 mr-2" />
                      Action Items
                    </div>
                  </button>
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
                      Full Transcript
                    </div>
                  </button>
                </nav>
              </div>

              {/* Content Sections */}
              <div className="p-6">
                {activeSection === 'summary' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">AI Generated Summary</h3>
                      <div className="flex items-center space-x-3">
                        <select
                          value={selectedTemplate}
                          onChange={(e) => setSelectedTemplate(e.target.value)}
                          className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                        >
                          {templates.map((template) => (
                            <option key={template.id} value={template.id} className="bg-gray-800">
                              {template.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={handleApplyTemplate}
                          disabled={!selectedTemplate || isRegenerating}
                          className="px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-md hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          Apply Template
                        </button>
                      </div>
                    </div>
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-line text-gray-300 leading-relaxed">
                        {note?.content?.generated as any || meetingData.summary}
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'actions' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Action Items</h3>
                    <div className="space-y-3">
                      {meetingData.actionItems.map((item) => (
                        <div key={item.id} className="border border-white/10 rounded-lg p-4 bg-white/5">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-white">{item.task}</h4>
                              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-400">
                                <span>Assignee: {item.assignee}</span>
                                <span>Due: {item.deadline}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                                {item.priority === 'high' ? 'High Priority' : item.priority === 'medium' ? 'Medium Priority' : 'Low Priority'}
                              </span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(item.status)}`}>
                                {item.status === 'completed' ? 'Completed' : item.status === 'in-progress' ? 'In Progress' : 'Pending'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === 'transcript' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Full Transcript</h3>
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