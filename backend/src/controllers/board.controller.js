const Board = require('../models/board.model');
const List = require('../models/list.model');
const Card = require('../models/card.model');
const Activity = require('../models/activity.model');
const socketService = require('../services/socket.service');

// Create a new board
exports.createBoard = async (req, res) => {
  try {
    const { title, background } = req.body;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ message: 'Title is required and must be a string' });
    }

    let board = await Board.create({
      title,
      background,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });

    // Populate the board data
    board = await Board.findById(board._id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    try {
      await socketService.emitBoardCreated(board, req.user._id);
    } catch (socketError) {
      console.error('Socket error:', socketError);
      // Continue without socket emission
    }

    res.status(201).json({
      id: board._id,
      title: board.title,
      background: board.background,
      owner: board.owner,
      members: board.members,
      lists: [],
      visibility: 'private',
      activity: []
    });
  } catch (error) {
    console.error('Board creation error:', error);
    res.status(500).json({ message: 'Error creating board', error: error.message });
  }
};

// Get all boards for the current user
exports.getBoards = async (req, res) => {
  try {
    console.log('Fetching boards for user:', req.user._id);
    const boards = await Board.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    })
    .populate('owner', 'name email')
    .populate('members.user', 'name email')
    .populate({
      path: 'lists',
      populate: {
        path: 'cards',
        populate: [
          { path: 'members', select: 'name email' },
          { path: 'comments.author', select: 'name email' }
        ]
      }
    });

    console.log('Found boards:', boards);

    // Format the boards data
    const formattedBoards = boards.map(board => ({
      id: board._id?.toString() || '',
      title: board.title,
      background: board.background || '#026AA7',
      owner: board.owner && board.owner._id ? {
        id: board.owner._id.toString(),
        name: board.owner.name,
        email: board.owner.email
      } : null,
      members: Array.isArray(board.members) ? board.members.filter(m => m && m.user && m.user._id).map(member => ({
        id: member.user._id.toString(),
        name: member.user.name,
        email: member.user.email,
        role: member.role
      })) : [],
      lists: Array.isArray(board.lists) ? board.lists.filter(l => l && l._id).map(list => ({
        id: list._id.toString(),
        title: list.title,
        cards: Array.isArray(list.cards) ? list.cards.filter(c => c && c._id).map(card => ({
          id: card._id.toString(),
          title: card.title,
          description: card.description,
          members: Array.isArray(card.members) ? card.members.filter(m => m && m._id).map(m => m._id.toString()) : [],
          labels: card.labels || [],
          dueDate: card.dueDate,
          position: card.position
        })) : []
      })) : [],
      visibility: board.visibility || 'private',
      isStarred: board.isStarred || false,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt
    }));

    console.log('Formatted boards:', formattedBoards);
    res.json(formattedBoards);
  } catch (error) {
    console.error('Error fetching boards:', error);
    res.status(500).json({ message: 'Error fetching boards', error: error.message });
  }
};

// Get a single board by ID
exports.getBoard = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Invalid board ID' });
    }

    const board = await Board.findById(id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email')
      .populate({
        path: 'lists',
        populate: {
          path: 'cards',
          populate: [
            { path: 'members', select: 'name email' },
            { path: 'comments.author', select: 'name email' }
          ]
        }
      });

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has access to the board
    const isMember = board.members.some(member => 
      member.user._id.toString() === req.user._id.toString()
    );

    if (!isMember && board.visibility !== 'public') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(board);
  } catch (error) {
    console.error('Error getting board:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid board ID format' });
    }
    res.status(500).json({ message: 'Error getting board', error: error.message });
  }
};

// Update a board
exports.updateBoard = async (req, res) => {
  try {
    const { title, description, background } = req.body;
    const updates = {};

    if (title) updates.title = title;
    if (description) updates.description = description;
    if (background) updates.background = background;

    const board = await Board.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).populate('owner', 'name email')
      .populate('members.user', 'name email');

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has admin access
    const isAdmin = board.owner._id.equals(req.user._id) ||
      board.members.some(member => 
        member.user._id.equals(req.user._id) && member.role === 'admin'
      );

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admins can update the board' });
    }

    await socketService.emitBoardUpdated(board, req.user._id, updates);

    res.json(board);
  } catch (error) {
    res.status(500).json({ message: 'Error updating board', error: error.message });
  }
};

// Delete a board
exports.deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user is the owner
    if (!board.owner._id.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only the owner can delete the board' });
    }

    // Delete all lists and cards
    const lists = await List.find({ board: board._id });
    const listIds = lists.map(list => list._id);

    await Card.deleteMany({ list: { $in: listIds } });
    await List.deleteMany({ board: board._id });
    await Activity.deleteMany({ board: board._id });
    await board.remove();

    await socketService.emitBoardDeleted(board._id, req.user._id);

    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting board', error: error.message });
  }
};

// Add a member to the board
exports.addMember = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const board = await Board.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has admin access
    const isAdmin = board.owner._id.equals(req.user._id) ||
      board.members.some(member => 
        member.user._id.equals(req.user._id) && member.role === 'admin'
      );

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admins can add members' });
    }

    // Check if user is already a member
    if (board.members.some(member => member.user._id.toString() === userId)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    await board.addMember(userId, role);
    await board.populate('members.user', 'name email');

    const newMember = board.members.find(member => member.user._id.toString() === userId);
    await socketService.emitMemberAdded(board, newMember.user, req.user._id);

    res.json(board);
  } catch (error) {
    res.status(500).json({ message: 'Error adding member', error: error.message });
  }
};

// Remove a member from the board
exports.removeMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const board = await Board.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has admin access
    const isAdmin = board.owner._id.equals(req.user._id) ||
      board.members.some(member => 
        member.user._id.equals(req.user._id) && member.role === 'admin'
      );

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admins can remove members' });
    }

    // Cannot remove the owner
    if (board.owner._id.toString() === userId) {
      return res.status(400).json({ message: 'Cannot remove the board owner' });
    }

    const memberToRemove = board.members.find(member => member.user._id.toString() === userId);
    if (!memberToRemove) {
      return res.status(404).json({ message: 'Member not found' });
    }

    await board.removeMember(userId);
    await socketService.emitMemberRemoved(board, memberToRemove.user, req.user._id);

    res.json(board);
  } catch (error) {
    res.status(500).json({ message: 'Error removing member', error: error.message });
  }
};

// Get board activities
exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ board: req.params.id })
      .populate('user', 'name email')
      .sort('-createdAt')
      .limit(100);

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching activities', error: error.message });
  }
}; 