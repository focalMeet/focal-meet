import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload as UploadIcon, Activity } from 'lucide-react';
import { createSession, uploadSessionAudio } from '../../lib/api';
import { isAuthenticated } from '../../lib/auth';

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadMessage, setUploadMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isAuthenticated()) navigate('/app/login');
  }, [navigate]);

  const handleSelectFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFilesChosen: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMessage(null);
    try {
      const created = await createSession();
      await uploadSessionAudio(created.sessionId, file);
      setUploadMessage('Upload succeeded. Transcription started.');
      navigate('/app/dashboard');
    } catch (err: any) {
      setUploadMessage(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <main className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-teal-500/20 border-2 border-teal-500/50 mb-6">
                <UploadIcon className="w-12 h-12 text-teal-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Upload Audio File</h2>
              <p className="text-gray-400">Supports MP3, WAV, M4A formats, maximum file size 100MB</p>
            </div>

            <div
              className="border-2 border-dashed border-white/20 rounded-xl p-12 hover:border-teal-400/50 transition-colors cursor-pointer bg-white/5 hover:bg-white/10"
              onClick={handleSelectFiles}
            >
              <div className="space-y-4">
                <UploadIcon className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-white">Drag files here</p>
                  <p className="text-sm text-gray-400">or click to select files</p>
                </div>
                <button
                  onClick={handleSelectFiles}
                  disabled={uploading}
                  className="px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Select Files
                </button>
                <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleFilesChosen} />
              </div>
            </div>

            <div className="mt-6 text-left">
              <h3 className="text-sm font-medium text-white mb-3">Recent Uploads</h3>
              <div className="space-y-2">
                {uploading && (
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-white">Uploading...</p>
                        <p className="text-xs text-gray-400">Starting transcription</p>
                      </div>
                    </div>
                    <div className="w-16 bg-white/10 rounded-full h-2">
                      <div className="bg-teal-500 h-2 rounded-full animate-pulse" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                )}
                {uploadMessage && (
                  <div className="p-3 bg-white/5 rounded-lg border border-white/10 text-sm text-gray-300">{uploadMessage}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UploadPage;


