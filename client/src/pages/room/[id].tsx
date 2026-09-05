import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import io, { Socket } from 'socket.io-client';
import { Toolbar } from '../../components/Toolbar';
import { AIPromptModal } from '../../components/AIPromptModal';
import { ToolType, CanvasElement, RemoteCursor } from '../../types';

export default function RoomPage() {
  const router = useRouter();
  const { id: roomId } = router.query;
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [currentTool, setTool] = useState<ToolType>('rectangle');
  const [color, setColor] = useState<string>('#38BDF8');
  const [strokeWidth, setStrokeWidth] = useState<number>(2);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [remoteCursors, setRemoteCursors] = useState<{ [id: string]: RemoteCursor }>({});
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);

  // User identity
  const [user] = useState(() => ({
    name: `User_${Math.floor(Math.random() * 1000)}`,
    color: ['#38BDF8', '#34D399', '#F472B6', '#FBBF24', '#A78BFA'][Math.floor(Math.random() * 5)]
  }));

  useEffect(() => {
    if (!roomId) return;

    const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
    const s = io(socketServerUrl);
    setSocket(s);

    s.emit('room:join', { roomId, user });

    s.on('room:state', ({ elements }) => {
      setElements(elements || []);
    });

    s.on('element:add', (elem: CanvasElement) => {
      setElements(prev => [...prev, elem]);
    });

    s.on('element:update', (elem: CanvasElement) => {
      setElements(prev => prev.map(e => e.id === elem.id ? elem : e));
    });

    s.on('element:delete', (elemId: string) => {
      setElements(prev => prev.filter(e => e.id !== elemId));
    });

    s.on('canvas:clear', () => {
      setElements([]);
    });

    s.on('cursor:update', (cursor: RemoteCursor) => {
      setRemoteCursors(prev => ({ ...prev, [cursor.userId]: cursor }));
    });

    s.on('user:left', (userId: string) => {
      setRemoteCursors(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    });

    return () => {
      s.disconnect();
    };
  }, [roomId]);

  // Render Canvas Elements
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Grid
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1;
    const gridSize = 30;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw Elements
    elements.forEach(elem => {
      ctx.strokeStyle = elem.color;
      ctx.lineWidth = elem.strokeWidth || 2;
      ctx.fillStyle = elem.fillColor || '#0F172A';

      if (elem.type === 'rectangle' || elem.type === 'sticky') {
        const w = elem.width || 100;
        const h = elem.height || 60;
        ctx.beginPath();
        ctx.roundRect(elem.x, elem.y, w, h, 8);
        ctx.fill();
        ctx.stroke();

        if (elem.text) {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '14px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(elem.text, elem.x + w / 2, elem.y + h / 2);
        }
      } else if (elem.type === 'circle') {
        const r = (elem.width || 80) / 2;
        ctx.beginPath();
        ctx.arc(elem.x + r, elem.y + r, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        if (elem.text) {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '14px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(elem.text, elem.x + r, elem.y + r);
        }
      } else if (elem.type === 'arrow') {
        ctx.beginPath();
        ctx.moveTo(elem.x, elem.y);
        ctx.lineTo(elem.x + (elem.width || 100), elem.y + (elem.height || 0));
        ctx.stroke();
      } else if (elem.type === 'pencil' && elem.points) {
        ctx.beginPath();
        elem.points.forEach((p, idx) => {
          if (idx === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();
      }
    });
  }, [elements]);

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true);
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (socket) {
      socket.emit('cursor:move', { x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const endX = e.clientX;
    const endY = e.clientY;
    const width = Math.abs(endX - startPos.x) || 120;
    const height = Math.abs(endY - startPos.y) || 70;
    const x = Math.min(startPos.x, endX);
    const y = Math.min(startPos.y, endY);

    const newElement: CanvasElement = {
      id: `elem_${Date.now()}`,
      type: currentTool,
      x,
      y,
      width,
      height,
      color,
      fillColor: '#0F172A',
      strokeWidth,
      text: currentTool === 'sticky' ? 'Note' : '',
      createdBy: user.name,
      createdAt: Date.now()
    };

    setElements(prev => [...prev, newElement]);
    if (socket) {
      socket.emit('element:add', newElement);
    }
  };

  const handleGenerateAI = async (prompt: string) => {
    const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
    await fetch(`${socketServerUrl}/api/diagram/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, roomId })
    });
  };

  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `CollabFlow_${roomId}.png`;
    link.href = image;
    link.click();
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 overflow-hidden select-none">
      {/* Top Left Room Info */}
      <div className="fixed top-5 left-5 z-40 bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-lg">
        <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">CollabFlow AI</span>
        <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-md">Room: {roomId}</span>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="Live Connected" />
      </div>

      <Toolbar
        currentTool={currentTool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        onClear={() => {
          setElements([]);
          socket?.emit('canvas:clear');
        }}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        onExport={handleExport}
      />

      <AIPromptModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onGenerate={handleGenerateAI}
      />

      {/* Remote Live Cursors */}
      {Object.values(remoteCursors).map(c => (
        <div
          key={c.userId}
          style={{ transform: `translate(${c.x}px, ${c.y}px)` }}
          className="pointer-events-none fixed top-0 left-0 transition-transform duration-75 z-40"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill={c.color}>
            <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L5.5 3.21z" />
          </svg>
          <span style={{ backgroundColor: c.color }} className="text-[10px] text-slate-950 font-bold px-1.5 py-0.5 rounded shadow">
            {c.userName}
          </span>
        </div>
      ))}

      <canvas
        ref={canvasRef}
        width={typeof window !== 'undefined' ? window.innerWidth : 1920}
        height={typeof window !== 'undefined' ? window.innerHeight : 1080}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="w-full h-full cursor-crosshair"
      />
    </div>
  );
}
