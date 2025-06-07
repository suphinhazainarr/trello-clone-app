const List = require('../models/list.model');
const Board = require('../models/board.model');
const socketService = require('../services/socket.service');

// Create a new list
exports.createList = async (req, res) => {
  try {
    const { title, position } = req.body;
    const boardId = req.params.boardId;

    // Check if user has access to the board
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const hasAccess = board.owner._id.equals(req.user._id) ||
      board.members.some(member => member.user._id.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const list = await List.create({
      title,
      position,
      board: boardId
    });

    await socketService.emitListCreated(list, req.user._id);

    res.status(201).json(list);
  } catch (error) {
    res.status(500).json({ message: 'Error creating list', error: error.message });
  }
};

// Update a list
exports.updateList = async (req, res) => {
  try {
    const { title, position } = req.body;
    const listId = req.params.id;

    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(list.board);
    const hasAccess = board.owner._id.equals(req.user._id) ||
      board.members.some(member => member.user._id.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = {};
    if (title) updates.title = title;
    if (position !== undefined) updates.position = position;

    const updatedList = await List.findByIdAndUpdate(
      listId,
      { $set: updates },
      { new: true }
    );

    await socketService.emitListUpdated(updatedList, req.user._id, updates);

    res.json(updatedList);
  } catch (error) {
    res.status(500).json({ message: 'Error updating list', error: error.message });
  }
};

// Delete a list
exports.deleteList = async (req, res) => {
  try {
    const listId = req.params.id;

    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(list.board);
    const hasAccess = board.owner._id.equals(req.user._id) ||
      board.members.some(member => member.user._id.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await list.remove();
    await socketService.emitListDeleted(list, req.user._id);

    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting list', error: error.message });
  }
};

// Reorder lists
exports.reorderLists = async (req, res) => {
  try {
    const { lists } = req.body;
    const boardId = req.params.boardId;

    // Check if user has access to the board
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const hasAccess = board.owner._id.equals(req.user._id) ||
      board.members.some(member => member.user._id.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update positions of all lists
    const updatePromises = lists.map(list => 
      List.findByIdAndUpdate(list._id, { position: list.position })
    );

    await Promise.all(updatePromises);

    // Get updated lists
    const updatedLists = await List.find({ board: boardId }).sort('position');

    res.json(updatedLists);
  } catch (error) {
    res.status(500).json({ message: 'Error reordering lists', error: error.message });
  }
}; 