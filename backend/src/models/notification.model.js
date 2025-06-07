const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'card_created',
      'card_updated',
      'card_moved',
      'card_deleted',
      'comment_added',
      'member_added',
      'member_removed',
      'due_date_approaching',
      'mention'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    boardId: mongoose.Schema.Types.ObjectId,
    cardId: mongoose.Schema.Types.ObjectId,
    listId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification; 