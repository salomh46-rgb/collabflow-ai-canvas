import React from 'react';
import { ToolType } from '../types';

interface ToolbarProps {
  currentTool: ToolType;
  setTool: (tool: ToolType) => void;
  color: string;
  setColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  onClear: () => void;
  onOpenAIModal: () => void;
  onExport: () => void;
}

const COLORS = ['#FFFFFF', '#38BDF8', '#34D399', '#F472B6', '#FBBF24', '#A78BFA', '#EF4444'];

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  setTool,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  onClear,
  onOpenAIModal,
  onExport
}) => {
  return (
    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-3 z-50">
      <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl">
        <button
          onClick={() => setTool('select')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${currentTool === 'select' ? 'bg-sky-500 text-white shadow' : 'text-slate-300 hover:bg-slate-700'}`}
          title="Select & Move"
        >
          👆 Select
        </button>
        <button
          onClick={() => setTool('pencil')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${currentTool === 'pencil' ? 'bg-sky-500 text-white shadow' : 'text-slate-300 hover:bg-slate-700'}`}
          title="Freehand Pencil"
        >
          ✏️ Draw
        </button>
        <button
          onClick={() => setTool('rectangle')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${currentTool === 'rectangle' ? 'bg-sky-500 text-white shadow' : 'text-slate-300 hover:bg-slate-700'}`}
          title="Rectangle"
        >
          ⬛️ Box
        </button>
        <button
          onClick={() => setTool('circle')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${currentTool === 'circle' ? 'bg-sky-500 text-white shadow' : 'text-slate-300 hover:bg-slate-700'}`}
          title="Circle"
        >
          ⭕️ Circle
        </button>
        <button
          onClick={() => setTool('arrow')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${currentTool === 'arrow' ? 'bg-sky-500 text-white shadow' : 'text-slate-300 hover:bg-slate-700'}`}
          title="Arrow"
        >
          ➡️ Arrow
        </button>
        <button
          onClick={() => setTool('sticky')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${currentTool === 'sticky' ? 'bg-sky-500 text-white shadow' : 'text-slate-300 hover:bg-slate-700'}`}
          title="Sticky Note"
        >
          📝 Note
        </button>
      </div>

      {/* Color Palette */}
      <div className="flex items-center gap-1.5 px-2 border-x border-slate-700">
        {COLORS.map(c => (
          <button
            key={c}
            onClick={() => setColor(c)}
            style={{ backgroundColor: c }}
            className={`w-6 h-6 rounded-full border-2 transition transform hover:scale-110 ${color === c ? 'border-sky-400 ring-2 ring-sky-400/50 scale-110' : 'border-transparent'}`}
          />
        ))}
      </div>

      {/* AI Generator Button */}
      <button
        onClick={onOpenAIModal}
        className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-3.5 py-1.5 rounded-xl text-sm font-semibold shadow-lg shadow-purple-500/25 transition transform hover:scale-105"
      >
        ✨ AI Diagram
      </button>

      {/* Export & Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onExport}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-sm font-medium transition"
          title="Export Canvas to Image"
        >
          💾 Export
        </button>
        <button
          onClick={onClear}
          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-2.5 py-1.5 rounded-lg text-sm font-medium transition"
          title="Clear Entire Canvas"
        >
          🗑
        </button>
      </div>
    </div>
  );
};
