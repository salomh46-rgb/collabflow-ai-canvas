import React from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const ForceDirectedTopologyGraph = dynamic(
  () => import('../components/ForceDirectedTopologyGraph'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[480px] rounded-3xl bg-slate-900/40 border border-slate-800 flex items-center justify-center text-slate-500 animate-pulse">
        Initializing 3D Knowledge Topology Engine...
      </div>
    ),
  }
);

export default function Home() {
  const router = useRouter();

  const createRoom = () => {
    const roomId = Math.random().toString(36).substring(2, 9);
    router.push(`/room/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden py-12">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[32rem] h-[32rem] bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl w-full z-10 space-y-16">
        {/* Hero Section: 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline & Call To Action */}
          <div className="lg:col-span-6 text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              ✨ Next-Gen Collaborative Canvas with Google Gemini AI
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Visual Brainstorming,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400">
                Supercharged by AI
              </span>
            </h1>

            <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
              Multiplayer real-time whiteboard with live cursors, WebSockets synchronization, and instantaneous natural-language system architecture generator.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={createRoom}
                className="bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:from-sky-400 hover:to-purple-500 text-white text-base font-bold px-8 py-4 rounded-2xl shadow-xl shadow-indigo-500/25 transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2.5"
              >
                <span>🚀 Create Live Whiteboard</span>
              </button>

              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>6 Nodes Synced Real-time</span>
              </div>
            </div>

            {/* Architecture Node Tags */}
            <div className="pt-2">
              <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2.5">
                Active System Topology
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Gemini 1.5 Pro', color: 'border-purple-500/40 text-purple-400 bg-purple-500/10' },
                  { name: 'WebSocket Server', color: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10' },
                  { name: 'PostgreSQL + Prisma', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
                  { name: 'Redis PubSub', color: 'border-rose-500/40 text-rose-400 bg-rose-500/10' },
                  { name: 'Vector Knowledge', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
                  { name: 'Client Canvas', color: 'border-sky-500/40 text-sky-400 bg-sky-500/10' },
                ].map((node) => (
                  <span
                    key={node.name}
                    className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border ${node.color}`}
                  >
                    {node.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Engine №12 Interactive 3D Graph */}
          <div className="lg:col-span-6 w-full h-[460px] sm:h-[500px]">
            <ForceDirectedTopologyGraph className="w-full h-full" showControls={true} />
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left pt-6">
          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-sm hover:border-slate-700 transition">
            <div className="text-2xl mb-2">⚡️</div>
            <h3 className="font-bold text-white mb-1">Real-time WebSockets</h3>
            <p className="text-slate-400 text-sm">Sub-20ms multiplayer cursors, sticky notes, and drawing synchronization.</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-sm hover:border-slate-700 transition">
            <div className="text-2xl mb-2">🤖</div>
            <h3 className="font-bold text-white mb-1">Gemini AI Diagrammer</h3>
            <p className="text-slate-400 text-sm">Convert text prompts into full architecture diagrams on canvas.</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-sm hover:border-slate-700 transition">
            <div className="text-2xl mb-2">📦</div>
            <h3 className="font-bold text-white mb-1">Export & Share</h3>
            <p className="text-slate-400 text-sm">Download PNG/SVG snapshots and share instant invite room links.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

