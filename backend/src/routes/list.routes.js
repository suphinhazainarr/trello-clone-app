const express = require('express');
const router = express.Router();
const listController = require('../controllers/list.controller');
const auth = require('../middlewares/auth.middleware');

// List routes
router.post('/boards/:boardId/lists', auth, listController.createList);
router.patch('/lists/:id', auth, listController.updateList);
router.delete('/lists/:id', auth, listController.deleteList);
router.post('/boards/:boardId/lists/reorder', auth, listController.reorderLists);

module.exports = router; 