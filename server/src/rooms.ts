import { v4 as uuidv4 } from 'uuid';

export interface CanvasElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: { x: number; y: number }[];
  text?: string;
  color: string;
  fillColor?: string;
  strokeWidth: number;
  createdBy: string;
  createdAt: number;
}

export class RoomManager {
  private rooms: Map<string, { elements: CanvasElement[]; users: Map<string, any> }> = new Map();

  getOrCreateRoom(roomId: string) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        elements: [],
        users: new Map()
      });
    }
    return this.rooms.get(roomId)!;
  }

  addElement(roomId: string, element: CanvasElement) {
    const room = this.getOrCreateRoom(roomId);
    room.elements.push(element);
    return element;
  }

  updateElement(roomId: string, element: CanvasElement) {
    const room = this.getOrCreateRoom(roomId);
    const index = room.elements.findIndex(e => e.id === element.id);
    if (index !== -1) {
      room.elements[index] = element;
    } else {
      room.elements.push(element);
    }
  }

  deleteElement(roomId: string, elementId: string) {
    const room = this.getOrCreateRoom(roomId);
    room.elements = room.elements.filter(e => e.id !== elementId);
  }

  clearRoom(roomId: string) {
    const room = this.getOrCreateRoom(roomId);
    room.elements = [];
  }

  getRoomElements(roomId: string): CanvasElement[] {
    const room = this.rooms.get(roomId);
    return room ? room.elements : [];
  }
}
