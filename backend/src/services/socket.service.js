const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Activity = require('../models/activity.model');

class SocketService {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // userId -> socket
  }

  initialize(server, options) {
    this.io = socketIO(server, options);

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
          return next(new Error('Authentication error: User not found'));
        }

        socket.user = user;
        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.user._id);
      this.userSockets.set(socket.user._id.toString(), socket);

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.user._id);
        this.userSockets.delete(socket.user._id.toString());
      });

      socket.on('join:board', (boardId) => {
        console.log('User joined board:', boardId);
        socket.join(`board:${boardId}`);
      });

      socket.on('leave:board', (boardId) => {
        console.log('User left board:', boardId);
        socket.leave(`board:${boardId}`);
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    });

    console.log('Socket.IO initialized');
  }

  // Emit events to all users in a board
  emitToBoardUsers(boardId, event, data) {
    if (!this.io) return;
    this.io.to(`board:${boardId}`).emit(event, data);
  }

  // Emit events to a specific user
  emitToUser(userId, event, data) {
    if (!this.io) return;
    const socket = this.userSockets.get(userId.toString());
    if (socket) {
      socket.emit(event, data);
    }
  }

  // Helper method to create activity log
  async createActivity(userId, type, boardId, description, metadata = {}) {
    const activity = await Activity.create({
      user: userId,
      type,
      board: boardId,
      description,
      metadata
    });
    return activity;
  }

  // Board events
  async emitBoardCreated(board, userId) {
    try {
      const activity = await this.createActivity(
        userId,
        'BOARD_CREATED',
        board._id,
        `${board.title} board was created`
      );

      // Emit to all connected users since the board was just created
      // and no one has joined the board room yet
      this.io.emit('board-created', {
        board,
        activity
      });

      // Also emit to the creator specifically
      const creatorSocket = this.userSockets.get(userId.toString());
      if (creatorSocket) {
        creatorSocket.join(`board:${board._id}`);
      }
    } catch (error) {
      console.error('Socket emitBoardCreated error:', error);
    }
  }

  async emitBoardUpdated(board, userId, changes) {
    const activity = await this.createActivity(
      userId,
      'BOARD_UPDATED',
      board._id,
      `${board.title} board was updated`,
      { changes }
    );

    this.io.to(`board:${board._id}`).emit('board-updated', {
      board,
      activity
    });
  }

  async emitBoardDeleted(boardId, userId) {
    const activity = await this.createActivity(
      userId,
      'BOARD_DELETED',
      boardId,
      'Board was deleted'
    );

    this.io.to(`board:${boardId}`).emit('board-deleted', {
      boardId,
      activity
    });
  }

  // List events
  async emitListCreated(list, userId) {
    const activity = await this.createActivity(
      userId,
      'LIST_CREATED',
      list.board,
      `List "${list.title}" was created`
    );

    this.io.to(`board:${list.board}`).emit('list-created', {
      list,
      activity
    });
  }

  async emitListUpdated(list, userId, changes) {
    const activity = await this.createActivity(
      userId,
      'LIST_UPDATED',
      list.board,
      `List "${list.title}" was updated`,
      { changes }
    );

    this.io.to(`board:${list.board}`).emit('list-updated', {
      list,
      activity
    });
  }

  async emitListDeleted(list, userId) {
    const activity = await this.createActivity(
      userId,
      'LIST_DELETED',
      list.board,
      `List "${list.title}" was deleted`
    );

    this.io.to(`board:${list.board}`).emit('list-deleted', {
      listId: list._id,
      activity
    });
  }

  // Card events
  async emitCardCreated(card, userId) {
    const activity = await this.createActivity(
      userId,
      'CARD_CREATED',
      card.board,
      `Card "${card.title}" was created in list "${card.list.title}"`
    );

    this.io.to(`board:${card.board}`).emit('card-created', {
      card,
      activity
    });
  }

  async emitCardUpdated(card, userId, changes) {
    const activity = await this.createActivity(
      userId,
      'CARD_UPDATED',
      card.board,
      `Card "${card.title}" was updated`,
      { changes }
    );

    this.io.to(`board:${card.board}`).emit('card-updated', {
      card,
      activity
    });
  }

  async emitCardDeleted(card, userId) {
    const activity = await this.createActivity(
      userId,
      'CARD_DELETED',
      card.board,
      `Card "${card.title}" was deleted`
    );

    this.io.to(`board:${card.board}`).emit('card-deleted', {
      cardId: card._id,
      activity
    });
  }
}

module.exports = new SocketService();