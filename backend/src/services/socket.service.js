const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Activity = require('../models/activity.model');

class SocketService {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // userId -> socket
  }

  initialize(server, corsOptions) {
    this.io = socketIO(server, {
      cors: corsOptions,
      transports: ['polling', 'websocket'],
      pingTimeout: 60000,
      pingInterval: 25000,
      connectTimeout: 20000,
      allowEIO3: true
    });

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
        next(new Error('Authentication error: Invalid token'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.user.name}`);
      this.userSockets.set(socket.user._id.toString(), socket);

      // Join board rooms
      socket.on('join-board', (boardId) => {
        console.log(`User ${socket.user.name} joining board ${boardId}`);
        socket.join(`board:${boardId}`);
      });

      // Leave board rooms
      socket.on('leave-board', (boardId) => {
        console.log(`User ${socket.user.name} leaving board ${boardId}`);
        socket.leave(`board:${boardId}`);
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user.name}`);
        this.userSockets.delete(socket.user._id.toString());
      });

      // Handle errors
      socket.on('error', (error) => {
        console.error(`Socket error for user ${socket.user.name}:`, error);
      });
    });
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

  async emitCardMoved(card, fromList, toList, userId) {
    const activity = await this.createActivity(
      userId,
      'CARD_MOVED',
      card.board,
      `Card "${card.title}" was moved from "${fromList.title}" to "${toList.title}"`
    );

    this.io.to(`board:${card.board}`).emit('card-moved', {
      card,
      fromList,
      toList,
      activity
    });
  }

  // Comment events
  async emitCommentAdded(card, comment, userId) {
    const activity = await this.createActivity(
      userId,
      'COMMENT_ADDED',
      card.board,
      `Comment was added to card "${card.title}"`
    );

    this.io.to(`board:${card.board}`).emit('comment-added', {
      cardId: card._id,
      comment,
      activity
    });

    // Notify mentioned users
    if (comment.mentions && comment.mentions.length > 0) {
      comment.mentions.forEach(userId => {
        const userSocket = this.userSockets.get(userId.toString());
        if (userSocket) {
          userSocket.emit('mention', {
            cardId: card._id,
            cardTitle: card.title,
            comment,
            activity
          });
        }
      });
    }
  }

  // Checklist events
  async emitChecklistCreated(card, checklist, userId) {
    const activity = await this.createActivity(
      userId,
      'CHECKLIST_CREATED',
      card.board,
      `Checklist "${checklist.title}" was added to card "${card.title}"`
    );

    this.io.to(`board:${card.board}`).emit('checklist-created', {
      cardId: card._id,
      checklist,
      activity
    });
  }

  async emitChecklistUpdated(card, checklist, userId, changes) {
    const activity = await this.createActivity(
      userId,
      'CHECKLIST_UPDATED',
      card.board,
      `Checklist "${checklist.title}" was updated in card "${card.title}"`,
      { changes }
    );

    this.io.to(`board:${card.board}`).emit('checklist-updated', {
      cardId: card._id,
      checklist,
      activity
    });
  }

  // Member events
  async emitMemberAdded(board, user, addedBy) {
    const activity = await this.createActivity(
      addedBy,
      'MEMBER_ADDED',
      board._id,
      `${user.name} was added to board "${board.title}"`
    );

    this.io.to(`board:${board._id}`).emit('member-added', {
      boardId: board._id,
      user,
      activity
    });

    // Notify the added user
    const userSocket = this.userSockets.get(user._id.toString());
    if (userSocket) {
      userSocket.emit('board-invitation', {
        board,
        activity
      });
    }
  }

  async emitMemberRemoved(board, user, removedBy) {
    const activity = await this.createActivity(
      removedBy,
      'MEMBER_REMOVED',
      board._id,
      `${user.name} was removed from board "${board.title}"`
    );

    this.io.to(`board:${board._id}`).emit('member-removed', {
      boardId: board._id,
      userId: user._id,
      activity
    });
  }

  // Attachment events
  async emitAttachmentAdded(card, attachment, userId) {
    const activity = await this.createActivity(
      userId,
      'ATTACHMENT_ADDED',
      card.board,
      `Attachment "${attachment.name}" was added to card "${card.title}"`
    );

    this.io.to(`board:${card.board}`).emit('attachment-added', {
      cardId: card._id,
      attachment,
      activity
    });
  }

  async emitAttachmentRemoved(card, attachment, userId) {
    const activity = await this.createActivity(
      userId,
      'ATTACHMENT_REMOVED',
      card.board,
      `Attachment "${attachment.name}" was removed from card "${card.title}"`
    );

    this.io.to(`board:${card.board}`).emit('attachment-removed', {
      cardId: card._id,
      attachmentId: attachment._id,
      activity
    });
  }
}

module.exports = new SocketService(); 