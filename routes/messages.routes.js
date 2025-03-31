
const express = require('express');
const router = express.Router();
const messagesController = require('../controllers/messages.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/create', authMiddleware, messagesController.createConversation);
router.post('/:conversationId/messages', authMiddleware, messagesController.addMessage);

router.get('/:conversationId', authMiddleware, messagesController.getConversationById);

router.get('/user/:userId', authMiddleware, messagesController.getConversationsByUser);

module.exports = router;
