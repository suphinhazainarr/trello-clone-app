const Card = require('../models/card.model');
const List = require('../models/list.model');
const Board = require('../models/board.model');
const socketService = require('../services/socket.service');

// Create a new card
exports.createCard = async (req, res) => {
  try {
    const { title, description, position } = req.body;
    const listId = req.params.listId;

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

    const card = await Card.create({
      title,
      description,
      position,
      list: listId,
      board: list.board
    });

    await list.addCard(card._id);
    await socketService.emitCardCreated(card, req.user._id);

    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ message: 'Error creating card', error: error.message });
  }
};

// Update a card
exports.updateCard = async (req, res) => {
  try {
    const cardId = req.params.id;
    const updates = req.body;

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(card.board);
    const hasAccess = board.owner._id.equals(req.user._id) ||
      board.members.some(member => member.user._id.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updatedCard = await Card.findByIdAndUpdate(
      cardId,
      { $set: updates },
      { new: true }
    ).populate('members', 'name email')
      .populate('comments.user', 'name email');

    await socketService.emitCardUpdated(updatedCard, req.user._id, updates);

    res.json(updatedCard);
  } catch (error) {
    res.status(500).json({ message: 'Error updating card', error: error.message });
  }
};

// Delete a card
exports.deleteCard = async (req, res) => {
  try {
    const cardId = req.params.id;

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(card.board);
    const hasAccess = board.owner._id.equals(req.user._id) ||
      board.members.some(member => member.user._id.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const list = await List.findById(card.list);
    await list.removeCard(cardId);
    await card.remove();

    await socketService.emitCardDeleted(card, req.user._id);

    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting card', error: error.message });
  }
};

// Move a card
exports.moveCard = async (req, res) => {
  try {
    const { sourceListId, targetListId, newPosition } = req.body;
    const cardId = req.params.id;

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(card.board);
    const hasAccess = board.owner._id.equals(req.user._id) ||
      board.members.some(member => member.user._id.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const sourceList = await List.findById(sourceListId);
    const targetList = await List.findById(targetListId);

    if (!sourceList || !targetList) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Remove card from source list
    await sourceList.removeCard(cardId);

    // Add card to target list
    await targetList.addCard(cardId);

    // Update card position and list
    const updatedCard = await Card.findByIdAndUpdate(
      cardId,
      {
        list: targetListId,
        position: newPosition
      },
      { new: true }
    ).populate('members', 'name email')
      .populate('comments.user', 'name email');

    await socketService.emitCardMoved(updatedCard, sourceList, targetList, req.user._id);

    res.json(updatedCard);
  } catch (error) {
    res.status(500).json({ message: 'Error moving card', error: error.message });
  }
};

// Add a comment to a card
exports.addComment = async (req, res) => {
  try {
    const { text, mentions } = req.body;
    const cardId = req.params.id;

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(card.board);
    const hasAccess = board.owner._id.equals(req.user._id) ||
      board.members.some(member => member.user._id.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await card.addComment(req.user._id, text, mentions);
    await card.populate('comments.user', 'name email');

    const comment = card.comments[card.comments.length - 1];
    await socketService.emitCommentAdded(card, comment, req.user._id);

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
};

// Update a comment
exports.updateComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { cardId, commentId } = req.params;

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(card.board);
    const hasAccess = board.owner._id.equals(req.user._id) ||
      board.members.some(member => member.user._id.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if user is the comment author
    const comment = card.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (!comment.user.equals(req.user._id)) {
      return res.status(403).json({ message: 'Only the comment author can update it' });
    }

    await card.updateComment(commentId, text);
    await card.populate('comments.user', 'name email');

    const updatedComment = card.comments.id(commentId);
    await socketService.emitCommentUpdated(card, updatedComment, req.user._id);

    res.json(updatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating comment', error: error.message });
  }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
  try {
    const { cardId, commentId } = req.params;

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(card.board);
    const hasAccess = board.owner._id.equals(req.user._id) ||
      board.members.some(member => member.user._id.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if user is the comment author or an admin
    const comment = card.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const isAdmin = board.owner._id.equals(req.user._id) ||
      board.members.some(member => 
        member.user._id.equals(req.user._id) && member.role === 'admin'
      );

    if (!comment.user.equals(req.user._id) && !isAdmin) {
      return res.status(403).json({ message: 'Only the comment author or an admin can delete it' });
    }

    await card.deleteComment(commentId);
    await socketService.emitCommentDeleted(card, commentId, req.user._id);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment', error: error.message });
  }
};

// Add a checklist to a card
exports.addChecklist = async (req, res) => {
  try {
    const { title } = req.body;
    const cardId = req.params.id;

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(card.board);
    const hasAccess = board.owner._id.equals(req.user._id) ||
      board.members.some(member => member.user._id.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await card.addChecklist(title);
    const checklist = card.checklists[card.checklists.length - 1];

    await socketService.emitChecklistCreated(card, checklist, req.user._id);

    res.json(checklist);
  } catch (error) {
    res.status(500).json({ message: 'Error adding checklist', error: error.message });
  }
};

// Update a checklist item
exports.updateChecklistItem = async (req, res) => {
  try {
    const { isCompleted } = req.body;
    const { cardId, checklistId, itemId } = req.params;

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(card.board);
    const hasAccess = board.owner._id.equals(req.user._id) ||
      board.members.some(member => member.user._id.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const checklist = card.checklists.id(checklistId);
    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }

    await card.updateChecklistItem(checklistId, itemId, {
      isCompleted,
      completedBy: isCompleted ? req.user._id : null
    });

    const updatedItem = checklist.items.id(itemId);
    await socketService.emitChecklistUpdated(card, checklist, req.user._id, {
      itemId,
      isCompleted
    });

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: 'Error updating checklist item', error: error.message });
  }
};

// Add an attachment to a card
exports.addAttachment = async (req, res) => {
  try {
    const { name, url, type, size } = req.body;
    const cardId = req.params.id;

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(card.board);
    const hasAccess = board.owner._id.equals(req.user._id) ||
      board.members.some(member => member.user._id.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await card.addAttachment(name, url, type, size, req.user._id);
    const attachment = card.attachments[card.attachments.length - 1];

    await socketService.emitAttachmentAdded(card, attachment, req.user._id);

    res.json(attachment);
  } catch (error) {
    res.status(500).json({ message: 'Error adding attachment', error: error.message });
  }
};

// Remove an attachment from a card
exports.removeAttachment = async (req, res) => {
  try {
    const { cardId, attachmentId } = req.params;

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(card.board);
    const hasAccess = board.owner._id.equals(req.user._id) ||
      board.members.some(member => member.user._id.equals(req.user._id));

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const attachment = card.attachments.id(attachmentId);
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    await card.removeAttachment(attachmentId);
    await socketService.emitAttachmentRemoved(card, attachment, req.user._id);

    res.json({ message: 'Attachment removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing attachment', error: error.message });
  }
}; 