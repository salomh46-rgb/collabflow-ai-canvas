import React, { useState } from 'react';

interface AIPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => Promise<void>;
}

export const AIPromptModal: React.FC<AIPromptModalProps> = ({ isOpen, onClose, onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    
    setLoading(true);
    try {
      await onGenerate(prompt);
      setPrompt('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    "E-commerce Microservices (Auth, Catalog, Cart, Payment, PostgreSQL, Redis)",
    "Telegram Bot Architecture with WebSockets, SQLite WAL & Gemini AI",
    "User Registration & OAuth Flowchart with 2FA",
    "Ride-Sharing App Backend (Client, Gateway, Driver Matching, Kafka, Redis)"
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <h3 className="text-xl font-bold text-white">AI Diagram Generator</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg">✕</button>
        </div>

        <p className="text-slate-400 text-sm mb-4">
          Describe the architecture, workflow, or system you want to visualize. Google Gemini will build the diagram on your live canvas.
        </p>

        <form onSubmit={handleSubmit}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Design a high-load payment gateway with Payme, Click, Redis cache, and Webhooks..."
            className="w-full h-28 bg-slate-800/90 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
          />

          <div className="my-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Sample Prompts:</p>
            <div className="flex flex-wrap gap-1.5">
              {samplePrompts.map((s, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setPrompt(s)}
                  className="bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs px-2.5 py-1 rounded-lg border border-slate-700 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-sky-500/25 transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Generating...' : '🚀 Generate Diagram'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
