import React from 'react';
import { Plus, Edit3, Trash2, MoreVertical } from 'lucide-react';
import { isAuthenticated } from '../../lib/auth';
import { useNavigate } from 'react-router-dom';
import { listTemplates as apiListTemplates, createTemplate as apiCreateTemplate, updateTemplate as apiUpdateTemplate, deleteTemplate as apiDeleteTemplate, TemplateRead } from '../../lib/api';

const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = React.useState<TemplateRead[]>([]);
  const [templatesLoading, setTemplatesLoading] = React.useState(false);
  const [templatesError, setTemplatesError] = React.useState<string | null>(null);
  const [creatingTemplate, setCreatingTemplate] = React.useState(false);
  const [newTplName, setNewTplName] = React.useState('');
  const [newTplPrompt, setNewTplPrompt] = React.useState('');
  const [savingTemplateId, setSavingTemplateId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isAuthenticated()) navigate('/app/login');
  }, [navigate]);

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

  React.useEffect(() => {
    fetchTemplates();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Template Management</h2>
            <button
              onClick={() => setCreatingTemplate((v) => !v)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              {creatingTemplate ? 'Cancel' : 'Create Template'}
            </button>
          </div>

          {creatingTemplate && (
            <div className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <div className="grid grid-cols-1 gap-4">
                <input
                  value={newTplName}
                  onChange={(e) => setNewTplName(e.target.value)}
                  placeholder="Template name"
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                />
                <textarea
                  value={newTplPrompt}
                  onChange={(e) => setNewTplPrompt(e.target.value)}
                  placeholder="Prompt..."
                  className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 h-28"
                />
                <div>
                  <button
                    disabled={!newTplName.trim() || !newTplPrompt.trim()}
                    onClick={async () => {
                      try {
                        await apiCreateTemplate({ name: newTplName.trim(), prompt: newTplPrompt.trim() });
                        setNewTplName('');
                        setNewTplPrompt('');
                        setCreatingTemplate(false);
                        await fetchTemplates();
                      } catch (e) {
                        // silent error
                      }
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templatesLoading && <div className="text-gray-400">Loading templates...</div>}
            {templatesError && !templatesLoading && (
              <div className="text-red-400">{templatesError}</div>
            )}
            {!templatesLoading && !templatesError &&
              templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-black/20 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-full">
                      <input
                        defaultValue={template.name}
                        onChange={(e) => {
                          (template as any).__name = e.target.value;
                        }}
                        className="w-full mb-2 px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50"
                      />
                      <textarea
                        defaultValue={template.prompt}
                        onChange={(e) => {
                          (template as any).__prompt = e.target.value;
                        }}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 h-24"
                      />
                    </div>
                    <button className="p-1 text-gray-400 hover:text-white transition-colors rounded hover:bg-white/5">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {template.is_system_template ? 'System' : 'Custom'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        disabled={savingTemplateId === template.id}
                        onClick={async () => {
                          try {
                            setSavingTemplateId(template.id);
                            await apiUpdateTemplate(template.id, {
                              name: (template as any).__name ?? template.name,
                              prompt: (template as any).__prompt ?? template.prompt,
                            });
                            await fetchTemplates();
                          } finally {
                            setSavingTemplateId(null);
                          }
                        }}
                        className="p-2 text-gray-400 hover:text-white transition-colors rounded hover:bg-white/5 disabled:opacity-50"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {!template.is_system_template && (
                        <button
                          onClick={async () => {
                            await apiDeleteTemplate(template.id);
                            await fetchTemplates();
                          }}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TemplatesPage;


