const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    }
  }],
  lists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List'
  }],
  background: {
    type: String,
    default: '#0079BF'
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
boardSchema.index({ owner: 1 });
boardSchema.index({ 'members.user': 1 });

// Methods
boardSchema.methods.addMember = async function(userId, role = 'member') {
  if (!this.members.some(member => member.user.toString() === userId)) {
    this.members.push({ user: userId, role });
    await this.save();
  }
  return this;
};

boardSchema.methods.removeMember = async function(userId) {
  this.members = this.members.filter(member => member.user.toString() !== userId);
  await this.save();
  return this;
};

boardSchema.methods.updateMemberRole = async function(userId, newRole) {
  const member = this.members.find(m => m.user.toString() === userId);
  if (member) {
    member.role = newRole;
    await this.save();
  }
  return this;
};

const Board = mongoose.model('Board', boardSchema);

module.exports = Board; 