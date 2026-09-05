import React from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  const createRoom = () => {
    const roomId = Math.random().toString(36).substring(2, 9);
    router.push(`/room/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />

      <div className="max-w-3xl text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold mb-6">
          ✨ Next-Gen Collaborative Canvas with Google Gemini AI
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6">
          Visual Brainstorming,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400">
            Supercharged by AI
          </span>
        </h1>

        <p className="text-slate-400 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
          Multiplayer real-time whiteboard with live cursors, WebSockets synchronization, and instantaneous natural-language system architecture generator.
        </p>

        <button
          onClick={createRoom}
          className="bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-lg font-bold px-8 py-4 rounded-2xl shadow-xl shadow-sky-500/25 transition transform hover:scale-105 active:scale-95"
        >
          🚀 Create Live Whiteboard
        </button>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
            <div className="text-2xl mb-2">⚡️</div>
            <h3 className="font-bold text-white mb-1">Real-time WebSockets</h3>
            <p className="text-slate-400 text-sm">Sub-20ms multiplayer cursors, sticky notes, and drawing synchronization.</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
            <div className="text-2xl mb-2">🤖</div>
            <h3 className="font-bold text-white mb-1">Gemini AI Diagrammer</h3>
            <p className="text-slate-400 text-sm">Convert text prompts into full architecture diagrams on canvas.</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-sm">
            <div className="text-2xl mb-2">📦</div>
            <h3 className="font-bold text-white mb-1">Export & Share</h3>
            <p className="text-slate-400 text-sm">Download PNG/SVG snapshots and share instant invite room links.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
