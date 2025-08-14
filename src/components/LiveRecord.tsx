import React, { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

const LiveRecord: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [notes, setNotes] = useState(''); // reserved for future save/export
  const [title, setTitle] = useState('');
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: '可以在这里记录会议过程你的笔记，支持markdown格式',
        emptyEditorClass: 'is-editor-empty',
        includeChildren: true,
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[65vh] md:min-h-[72vh]'
      }
    },
    onUpdate: ({ editor }) => {
      setNotes(editor.getHTML());
    },
  });
  const timerRef = useRef<number | null>(null);

  const start = () => {
    if (timerRef.current) return;
    setIsRecording(true);
    timerRef.current = window.setInterval(() => {
      setElapsed((s) => s + 1);
    }, 1000);
  };

  const stop = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  };

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const format = (s: number) => {
    const hh = Math.floor(s / 3600);
    const mm = Math.floor((s % 3600) / 60);
    const ss = s % 60;
    return [hh, mm, ss].map((n) => String(n).padStart(2, '0')).join(':');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center mb-6 space-x-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Intro call: ..."
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40"
          />
          <div className="text-2xl md:text-3xl font-mono font-bold text-red-400 flex items-center">
            {isRecording && <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-3" />}
            {format(elapsed)}
          </div>
          {!isRecording ? (
            <button onClick={start} className="px-5 py-3 md:px-6 md:py-3 text-base md:text-lg bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg whitespace-nowrap">
              Start
            </button>
          ) : (
            <button onClick={stop} className="px-5 py-3 md:px-6 md:py-3 text-base md:text-lg bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg whitespace-nowrap">
              Stop
            </button>
          )}
        </div>

        <div className="bg-black/30 border border-white/10 rounded-2xl p-4 min-h-[50vh]">
          <div className="prose prose-invert max-w-none leading-relaxed prose-p:my-1 prose-headings:my-2 prose-h1:my-3 prose-h2:my-2 prose-h3:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-pre:my-2">
            <EditorContent editor={editor} data-placeholder="可以在这里记录会议过程你的笔记，支持markdown格式" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveRecord;


