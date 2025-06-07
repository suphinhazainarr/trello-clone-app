const express = require('express');
const router = express.Router();
const Card = require('../models/card.model');
const Board = require('../models/board.model');
const auth = require('../middlewares/auth.middleware');
const cardController = require('../controllers/card.controller');

// Create a new card
router.post('/', auth, async (req, res) => {
  try {
    const { boardId, listId, title, position } = req.body;

    // Check if user has access to the board
    const board = await Board.findById(boardId);
    if (!board || !board.hasPermission(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const card = new Card({
      title,
      list: listId,
      board: boardId,
      position
    });
    await card.save();
    res.status(201).json(card);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all cards for a board
router.get('/board/:boardId', auth, async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);
    if (!board || !board.hasPermission(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const cards = await Card.find({ board: req.params.boardId })
      .populate('members', 'username email')
      .sort('position');
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific card
router.get('/:id', auth, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id)
      .populate('members', 'username email')
      .populate('comments.user', 'username email');

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(card.board);
    if (!board || !board.hasPermission(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(card);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a card
router.patch('/:id', auth, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(card.board);
    if (!board || !board.hasPermission(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    Object.assign(card, req.body);
    await card.save();
    res.json(card);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a card
router.delete('/:id', auth, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(card.board);
    if (!board || !board.hasPermission(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await card.remove();
    res.json({ message: 'Card deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a member to a card
router.post('/:id/members', auth, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(card.board);
    if (!board || !board.hasPermission(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { userId } = req.body;
    await card.addMember(userId);
    res.json(card);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove a member from a card
router.delete('/:id/members/:userId', auth, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(card.board);
    if (!board || !board.hasPermission(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await card.removeMember(req.params.userId);
    res.json(card);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add a comment to a card
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(card.board);
    if (!board || !board.hasPermission(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { text } = req.body;
    await card.addComment(req.user._id, text);
    res.json(card);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add an attachment to a card
router.post('/:id/attachments', auth, async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(card.board);
    if (!board || !board.hasPermission(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, url, type } = req.body;
    await card.addAttachment(req.user._id, name, url, type);
    res.json(card);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Card routes
router.post('/lists/:listId/cards', auth, cardController.createCard);
router.patch('/cards/:id', auth, cardController.updateCard);
router.delete('/cards/:id', auth, cardController.deleteCard);
router.post('/cards/:id/move', auth, cardController.moveCard);

// Comment routes
router.post('/cards/:id/comments', auth, cardController.addComment);
router.patch('/cards/:cardId/comments/:commentId', auth, cardController.updateComment);
router.delete('/cards/:cardId/comments/:commentId', auth, cardController.deleteComment);

// Checklist routes
router.post('/cards/:id/checklists', auth, cardController.addChecklist);
router.patch('/cards/:cardId/checklists/:checklistId/items/:itemId', auth, cardController.updateChecklistItem);

// Attachment routes
router.post('/cards/:id/attachments', auth, cardController.addAttachment);
router.delete('/cards/:cardId/attachments/:attachmentId', auth, cardController.removeAttachment);

module.exports = router; 