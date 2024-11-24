const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
    checkAdminRole,
    sendMessage,
    getMessages,
    markAsRead,
    deleteMessage
} = require('../controllers/messageController');

// All routes require authentication
router.use(authMiddleware);

// Routes for sending messages (admin/superadmin only)
router.post('/send', checkAdminRole, sendMessage);

// Routes for all users
router.get('/', getMessages);
router.put('/:message_id/read', markAsRead);
router.delete('/:message_id', deleteMessage);

module.exports = router;
