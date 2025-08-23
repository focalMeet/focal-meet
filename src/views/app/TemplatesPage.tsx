import React from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { isAuthenticated } from '../../lib/auth';
import { useNavigate } from 'react-router-dom';
import { listTemplates as apiListTemplates, deleteTemplate as apiDeleteTemplate, TemplateRead } from '../../lib/api';

const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = React.useState<TemplateRead[]>([]);
  const [templatesLoading, setTemplatesLoading] = React.useState(false);
  const [templatesError, setTemplatesError] = React.useState<string | null>(null);
  // creation states are not used in mock mode for now
  const useMockTemplates = true;
  const mockTemplates: TemplateRead[] = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'General Summary',
      prompt: 'Summarize the meeting into concise bullet points, highlighting key decisions and next steps.',
      is_system_template: true,
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Action Items Extractor',
      prompt: 'Extract clear action items with owners and due dates from the conversation.',
      is_system_template: true,
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      name: 'Custom: Weekly Sync Focus',
      prompt: 'Summarize our weekly sync focusing on blockers, progress, and priorities for next week.',
      is_system_template: false,
      user_id: 'mock-user-id',
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      name: 'Custom: Sales Call Notes',
      prompt: 'Capture prospect pain points, objections, competitors, budget, and next steps from the sales call.',
      is_system_template: false,
      user_id: 'mock-user-id',
    },
  ];

  React.useEffect(() => {
    if (!isAuthenticated()) navigate('/app/login');
  }, [navigate]);

  const fetchTemplates = async () => {
    setTemplatesLoading(true);
    setTemplatesError(null);
    try {
      if (useMockTemplates) {
        setTemplates(mockTemplates);
      } else {
        const data = await apiListTemplates();
        setTemplates(data);
      }
    } catch (e: any) {
      // 提供更友好的错误信息
      let errorMessage = 'Failed to load templates';
      if (e?.status === 403) {
        errorMessage = '权限不足，请重新登录';
      } else if (e?.status === 401) {
        errorMessage = '登录已过期，请重新登录';
      } else if (e?.message) {
        errorMessage = e.message;
      }
      setTemplatesError(errorMessage);
    } finally {
      setTemplatesLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTemplates();
  }, []);

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Templates</h2>
            <div className="text-sm text-gray-400">System & Custom</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templatesLoading && <div className="text-gray-400">Loading templates...</div>}
            {templatesError && !templatesLoading && (
              <div className="text-red-400">{templatesError}</div>
            )}
            {!templatesLoading && !templatesError && (
              <>
                <div className="md:col-span-2 lg:col-span-3">
                  <h3 className="text-xl font-semibold text-white mb-4">System</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.filter(t => t.is_system_template).map((template) => (
                      <button
                        key={template.id}
                        onClick={() => navigate(`/app/templates/${template.id}`)}
                        className="text-left bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:border-white/20 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-base font-semibold text-white">{template.name}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-300">
                            System
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-3 whitespace-pre-wrap">
                          {template.prompt}
                        </p>
                      </button>
                    ))}
                    {templates.filter(t => t.is_system_template).length === 0 && (
                      <div className="text-gray-400">No system templates.</div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 lg:col-span-3 mt-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">Custom</h3>
                    <button
                      onClick={() => navigate('/app/templates/new')}
                      className="inline-flex items-center px-3 py-1.5 text-sm rounded-md bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                      Create Template
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.filter(t => !t.is_system_template).map((template) => (
                      <div
                        key={template.id}
                        className="text-left bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:border-white/20 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-base font-semibold text-white">{template.name}</h3>
                          <span className="text-xs px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                            Custom
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-3 whitespace-pre-wrap mb-4">
                          {template.prompt}
                        </p>
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => navigate(`/app/templates/${template.id}`)}
                            className="inline-flex items-center px-3 py-1.5 text-xs rounded-md bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10"
                          >
                            <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit
                          </button>
                          <button
                            onClick={async () => {
                              await apiDeleteTemplate(template.id);
                              await fetchTemplates();
                            }}
                            className="inline-flex items-center px-3 py-1.5 text-xs rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                    {templates.filter(t => !t.is_system_template).length === 0 && (
                      <div className="text-gray-400">No custom templates yet.</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TemplatesPage;


