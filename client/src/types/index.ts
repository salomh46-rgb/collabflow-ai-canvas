export type ToolType = 
  | 'select' 
  | 'rectangle' 
  | 'circle' 
  | 'arrow' 
  | 'pencil' 
  | 'text' 
  | 'sticky'
  | 'eraser';

export interface Point {
  x: number;
  y: number;
}

export interface CanvasElement {
  id: string;
  type: ToolType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: Point[];
  text?: string;
  color: string;
  fillColor?: string;
  strokeWidth: number;
  createdBy: string;
  createdAt: number;
}

export interface RemoteCursor {
  userId: string;
  userName: string;
  color: string;
  x: number;
  y: number;
}

export interface RoomState {
  roomId: string;
  elements: CanvasElement[];
  users: { [userId: string]: { name: string; color: string } };
}

export interface AIDiagramRequest {
  prompt: string;
  roomId: string;
}
