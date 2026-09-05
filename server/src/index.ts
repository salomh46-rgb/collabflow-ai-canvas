import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './rooms';
import { generateAIDiagram } from './ai_diagrammer';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const roomManager = new RoomManager();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'HEALTHY 🟢', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// AI Diagram Generation Endpoint
app.post('/api/diagram/generate', async (req, res) => {
  const { prompt, roomId } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const elements = await generateAIDiagram(prompt, GEMINI_API_KEY);
    
    // Broadcast newly generated elements to all room participants
    if (roomId) {
      elements.forEach(elem => {
        const fullElem = {
          ...elem,
          id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          strokeWidth: 2,
          createdBy: 'AI Architect',
          createdAt: Date.now()
        };
        roomManager.addElement(roomId, fullElem);
        io.to(roomId).emit('element:add', fullElem);
      });
    }

    res.json({ success: true, count: elements.length, elements });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket Real-time Handlers
io.on('connection', (socket: Socket) => {
  let currentRoom: string | null = null;
  let currentUser: { id: string; name: string; color: string } | null = null;

  socket.on('room:join', ({ roomId, user }) => {
    currentRoom = roomId;
    currentUser = { ...user, id: socket.id };
    socket.join(roomId);

    // Send existing canvas elements to newly joined user
    const existingElements = roomManager.getRoomElements(roomId);
    socket.emit('room:state', { elements: existingElements });

    // Notify other users about new user
    socket.to(roomId).emit('user:joined', currentUser);
    console.log(`User ${currentUser.name} joined room ${roomId}`);
  });

  socket.on('cursor:move', (coords) => {
    if (currentRoom && currentUser) {
      socket.to(currentRoom).emit('cursor:update', {
        userId: socket.id,
        userName: currentUser.name,
        color: currentUser.color,
        x: coords.x,
        y: coords.y
      });
    }
  });

  socket.on('element:add', (element) => {
    if (currentRoom) {
      roomManager.addElement(currentRoom, element);
      socket.to(currentRoom).emit('element:add', element);
    }
  });

  socket.on('element:update', (element) => {
    if (currentRoom) {
      roomManager.updateElement(currentRoom, element);
      socket.to(currentRoom).emit('element:update', element);
    }
  });

  socket.on('element:delete', (elementId) => {
    if (currentRoom) {
      roomManager.deleteElement(currentRoom, elementId);
      socket.to(currentRoom).emit('element:delete', elementId);
    }
  });

  socket.on('canvas:clear', () => {
    if (currentRoom) {
      roomManager.clearRoom(currentRoom);
      io.to(currentRoom).emit('canvas:clear');
    }
  });

  socket.on('disconnect', () => {
    if (currentRoom) {
      socket.to(currentRoom).emit('user:left', socket.id);
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 CollabFlow AI WebSocket Server running on port ${PORT}`);
});
