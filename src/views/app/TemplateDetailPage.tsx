import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { listTemplates, updateTemplate, deleteTemplate, TemplateRead } from '../../lib/api';

const TemplateDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [templates, setTemplates] = React.useState<TemplateRead[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState(false);
  const [nameDraft, setNameDraft] = React.useState('');
  const [promptDraft, setPromptDraft] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listTemplates();
        if (!cancelled) setTemplates(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load templates');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const template = React.useMemo(() => templates.find(t => t.id === (id || '')), [templates, id]);

  React.useEffect(() => {
    if (template) {
      setNameDraft(template.name);
      setPromptDraft(template.prompt);
    }
  }, [template]);

  return (
    <div className="h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <main className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-3 py-1.5 text-sm rounded-md bg-white/10 hover:bg-white/20 text-gray-200"
        >Back</button>

        {loading && <div className="text-gray-400">Loading...</div>}
        {error && !loading && <div className="text-red-400">{error}</div>}
        {!loading && !error && !template && (
          <div className="text-gray-400">Template not found.</div>
        )}
        {!loading && !error && template && (
          <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">{template.name}</h2>
              {template.is_system_template ? (
                <span className="text-xs px-2 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-300">System</span>
              ) : (
                <span className="text-xs px-2 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">Custom</span>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">Prompt</h3>
              {!editing ? (
                <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-sm text-gray-200 whitespace-pre-wrap">
                  {template.prompt}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  <input
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
                  />
                  <textarea
                    value={promptDraft}
                    onChange={(e) => setPromptDraft(e.target.value)}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 h-40"
                  />
                </div>
              )}
            </div>

            {!template.is_system_template && (
              <div className="mt-6 flex items-center justify-end space-x-2">
                {!editing ? (
                  <>
                    <button
                      onClick={() => setEditing(true)}
                      className="px-4 py-2 text-sm rounded-md bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10"
                    >Edit</button>
                    <button
                      onClick={async () => {
                        await deleteTemplate(template.id);
                        navigate('/app/templates');
                      }}
                      className="px-4 py-2 text-sm rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/20"
                    >Delete</button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 text-sm rounded-md bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10"
                    >Cancel</button>
                    <button
                      disabled={!nameDraft.trim() || !promptDraft.trim() || saving}
                      onClick={async () => {
                        try {
                          setSaving(true);
                          await updateTemplate(template.id, { name: nameDraft.trim(), prompt: promptDraft.trim() });
                          // refresh list to reflect updates
                          const data = await listTemplates();
                          setTemplates(data);
                          setEditing(false);
                        } finally {
                          setSaving(false);
                        }
                      }}
                      className="px-4 py-2 text-sm rounded-md bg-gradient-to-r from-emerald-500 to-emerald-600 text-white disabled:opacity-50"
                    >Save</button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default TemplateDetailPage;



