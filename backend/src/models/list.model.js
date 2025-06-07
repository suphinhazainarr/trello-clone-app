const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: Number,
    required: true
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  cards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card'
  }],
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
listSchema.index({ board: 1, position: 1 });

// Methods
listSchema.methods.addCard = async function(cardId) {
  if (!this.cards.includes(cardId)) {
    this.cards.push(cardId);
    await this.save();
  }
  return this;
};

listSchema.methods.removeCard = async function(cardId) {
  this.cards = this.cards.filter(id => id.toString() !== cardId.toString());
  await this.save();
  return this;
};

listSchema.methods.reorderCards = async function(cardIds) {
  this.cards = cardIds;
  await this.save();
  return this;
};

const List = mongoose.model('List', listSchema);

module.exports = List; 