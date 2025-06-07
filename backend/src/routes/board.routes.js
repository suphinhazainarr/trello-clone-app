const express = require('express');
const router = express.Router();
const boardController = require('../controllers/board.controller');
const auth = require('../middlewares/auth.middleware');

// Board routes
router.post('/', auth, boardController.createBoard);
router.get('/', auth, boardController.getBoards);
router.get('/:id', auth, boardController.getBoard);
router.patch('/:id', auth, boardController.updateBoard);
router.delete('/:id', auth, boardController.deleteBoard);

// Member routes
router.post('/:id/members', auth, boardController.addMember);
router.delete('/:id/members/:userId', auth, boardController.removeMember);

// Activity routes
router.get('/:id/activities', auth, boardController.getActivities);

module.exports = router; 