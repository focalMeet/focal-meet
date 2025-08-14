import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createTemplate } from '../../lib/api';
import { isAuthenticated } from '../../lib/auth';

const TemplateCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = React.useState('');
  const [prompt, setPrompt] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isAuthenticated()) navigate('/app/login');
  }, [navigate]);

  const canSave = name.trim().length > 0 && prompt.trim().length > 0 && !saving;

  const handleSubmit = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    try {
      const created = await createTemplate({ name: name.trim(), prompt: prompt.trim() });
      navigate(`/app/templates/${created.id}`);
    } catch (e: any) {
      setError(e?.message || 'Failed to create template');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <main className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Create Template</h2>
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-1.5 text-sm rounded-md bg-white/10 hover:bg-white/20 text-gray-200"
          >Back</button>
        </div>

        <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Quarterly Review Summary"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  'Describe how the AI should generate notes. For example:\n- Summarize key decisions\n- Extract action items with owners and due dates\n- Provide risks and follow-ups'
                }
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 h-64"
              />
              <div className="mt-1 text-xs text-gray-500">Tip: Write clear instructions; the better the prompt, the better the results.</div>
            </div>

            {error && <div className="text-sm text-red-400">{error}</div>}

            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => navigate('/app/templates')}
                className="px-4 py-2 text-sm rounded-md bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10"
              >Cancel</button>
              <button
                disabled={!canSave}
                onClick={handleSubmit}
                className="px-4 py-2 text-sm rounded-md bg-gradient-to-r from-emerald-500 to-emerald-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >{saving ? 'Saving...' : 'Create'}</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TemplateCreatePage;



