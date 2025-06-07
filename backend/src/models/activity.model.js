const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'BOARD_CREATED',
      'BOARD_UPDATED',
      'BOARD_DELETED',
      'LIST_CREATED',
      'LIST_UPDATED',
      'LIST_DELETED',
      'CARD_CREATED',
      'CARD_UPDATED',
      'CARD_DELETED',
      'CARD_MOVED',
      'COMMENT_ADDED',
      'COMMENT_UPDATED',
      'COMMENT_DELETED',
      'CHECKLIST_CREATED',
      'CHECKLIST_UPDATED',
      'CHECKLIST_DELETED',
      'MEMBER_ADDED',
      'MEMBER_REMOVED',
      'ATTACHMENT_ADDED',
      'ATTACHMENT_REMOVED'
    ]
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  list: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List'
  },
  card: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card'
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for faster queries
activitySchema.index({ board: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ card: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity; 