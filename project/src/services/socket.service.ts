import { io, Socket } from 'socket.io-client';
import { Board, Card, List } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;
  private boardListeners: Map<string, Function[]> = new Map();

  connect() {
    if (this.socket) return;

    const token = localStorage.getItem('trello-token');
    if (!token) return;

    this.socket = io(API_URL, {
      auth: { token },
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      forceNew: true
    });

    this.setupListeners();
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Board events
    this.socket.on('board-created', ({ board, activity }) => {
      this.notifyBoardListeners('created', board);
    });

    this.socket.on('board-updated', ({ board, activity }) => {
      this.notifyBoardListeners('updated', board);
    });

    this.socket.on('board-deleted', ({ boardId, activity }) => {
      this.notifyBoardListeners('deleted', boardId);
    });

    // List events
    this.socket.on('list-created', ({ list, activity }) => {
      this.notifyBoardListeners('listCreated', list);
    });

    this.socket.on('list-updated', ({ list, activity }) => {
      this.notifyBoardListeners('listUpdated', list);
    });

    this.socket.on('list-deleted', ({ listId, activity }) => {
      this.notifyBoardListeners('listDeleted', listId);
    });

    // Card events
    this.socket.on('card-created', ({ card, activity }) => {
      this.notifyBoardListeners('cardCreated', card);
    });

    this.socket.on('card-updated', ({ card, activity }) => {
      this.notifyBoardListeners('cardUpdated', card);
    });

    this.socket.on('card-deleted', ({ cardId, activity }) => {
      this.notifyBoardListeners('cardDeleted', cardId);
    });

    this.socket.on('card-moved', ({ card, fromList, toList, activity }) => {
      this.notifyBoardListeners('cardMoved', { card, fromList, toList });
    });
  }

  joinBoard(boardId: string) {
    if (!this.socket) return;
    this.socket.emit('join-board', boardId);
  }

  leaveBoard(boardId: string) {
    if (!this.socket) return;
    this.socket.emit('leave-board', boardId);
  }

  onBoardEvent(boardId: string, callback: Function) {
    if (!this.boardListeners.has(boardId)) {
      this.boardListeners.set(boardId, []);
    }
    this.boardListeners.get(boardId)?.push(callback);
  }

  offBoardEvent(boardId: string, callback: Function) {
    const listeners = this.boardListeners.get(boardId);
    if (!listeners) return;

    const index = listeners.indexOf(callback);
    if (index !== -1) {
      listeners.splice(index, 1);
    }

    if (listeners.length === 0) {
      this.boardListeners.delete(boardId);
    }
  }

  private notifyBoardListeners(event: string, data: any) {
    this.boardListeners.forEach((listeners) => {
      listeners.forEach((listener) => {
        listener(event, data);
      });
    });
  }
}

export const socketService = new SocketService(); 