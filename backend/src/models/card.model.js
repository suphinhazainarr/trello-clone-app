const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

const checklistItemSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completedAt: Date
});

const checklistSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  items: [checklistItemSchema]
}, {
  timestamps: true
});

const attachmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  size: Number,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  list: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List',
    required: true
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  position: {
    type: Number,
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  labels: [{
    color: String,
    text: String
  }],
  dueDate: Date,
  comments: [commentSchema],
  checklists: [checklistSchema],
  attachments: [attachmentSchema],
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
cardSchema.index({ list: 1, position: 1 });
cardSchema.index({ board: 1 });
cardSchema.index({ 'members': 1 });

// Methods
cardSchema.methods.addMember = async function(userId) {
  if (!this.members.includes(userId)) {
    this.members.push(userId);
    await this.save();
  }
  return this;
};

cardSchema.methods.removeMember = async function(userId) {
  this.members = this.members.filter(id => id.toString() !== userId.toString());
  await this.save();
  return this;
};

cardSchema.methods.addComment = async function(userId, text, mentions = []) {
  this.comments.push({ user: userId, text, mentions });
  await this.save();
  return this;
};

cardSchema.methods.updateComment = async function(commentId, text) {
  const comment = this.comments.id(commentId);
  if (comment) {
    comment.text = text;
    await this.save();
  }
  return this;
};

cardSchema.methods.deleteComment = async function(commentId) {
  this.comments = this.comments.filter(comment => comment._id.toString() !== commentId);
  await this.save();
  return this;
};

cardSchema.methods.addChecklist = async function(title) {
  this.checklists.push({ title, items: [] });
  await this.save();
  return this;
};

cardSchema.methods.updateChecklistItem = async function(checklistId, itemId, updates) {
  const checklist = this.checklists.id(checklistId);
  if (checklist) {
    const item = checklist.items.id(itemId);
    if (item) {
      Object.assign(item, updates);
      if (updates.isCompleted) {
        item.completedAt = new Date();
      }
      await this.save();
    }
  }
  return this;
};

cardSchema.methods.addAttachment = async function(name, url, type, size, userId) {
  this.attachments.push({
    name,
    url,
    type,
    size,
    uploadedBy: userId
  });
  await this.save();
  return this;
};

cardSchema.methods.removeAttachment = async function(attachmentId) {
  this.attachments = this.attachments.filter(
    attachment => attachment._id.toString() !== attachmentId
  );
  await this.save();
  return this;
};

const Card = mongoose.model('Card', cardSchema);

module.exports = Card; 