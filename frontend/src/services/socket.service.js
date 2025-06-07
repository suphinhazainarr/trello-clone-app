import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(process.env.REACT_APP_API_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.setupListeners();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  setupListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket.IO error:', error);
    });
  }

  // Board events
  joinBoard(boardId) {
    this.socket.emit('join-board', boardId);
  }

  leaveBoard(boardId) {
    this.socket.emit('leave-board', boardId);
  }

  // Card events
  createCard(data) {
    this.socket.emit('create-card', data);
  }

  updateCard(data) {
    this.socket.emit('update-card', data);
  }

  deleteCard(data) {
    this.socket.emit('delete-card', data);
  }

  moveCard(data) {
    this.socket.emit('move-card', data);
  }

  // Comment events
  addComment(data) {
    this.socket.emit('add-comment', data);
  }

  // Member events
  addMember(data) {
    this.socket.emit('add-member', data);
  }

  removeMember(data) {
    this.socket.emit('remove-member', data);
  }

  // Event listeners
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
      this.socket.off(event, callback);
    }
  }

  // Remove all listeners for an event
  removeAllListeners(event) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        this.socket.off(event, callback);
      });
      this.listeners.delete(event);
    }
  }
}

export default new SocketService(); 