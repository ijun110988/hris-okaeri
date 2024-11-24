const Message = require('../models/message');
const User = require('../models/user');
const { Op } = require('sequelize');

// Middleware to check if user is admin or superadmin
const checkAdminRole = (req, res, next) => {
    const { role } = req.user;
    console.log('User role:', role); // Debug log
    console.log('User object:', req.user); // Debug full user object
    if (role !== 'admin' && role !== 'super_admin') {
        return res.status(403).json({
            status: 'error',
            message: 'Only admin and superadmin can send messages'
        });
    }
    next();
};

// Send a message (personal or broadcast)
const sendMessage = async (req, res) => {
    try {
        const { title, content, type, recipient_id } = req.body;
        const sender_id = req.user.id;

        // Validate message type
        if (!['personal', 'broadcast'].includes(type)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid message type'
            });
        }

        // For personal messages, validate recipient
        if (type === 'personal' && !recipient_id) {
            return res.status(400).json({
                status: 'error',
                message: 'Recipient ID is required for personal messages'
            });
        }

        // Check if recipient exists for personal messages
        if (type === 'personal') {
            const recipient = await User.findByPk(recipient_id);
            if (!recipient) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Recipient not found'
                });
            }
        }

        // Create message
        const message = await Message.create({
            title,
            content,
            type,
            sender_id,
            recipient_id: type === 'personal' ? recipient_id : null
        });

        res.json({
            status: 'success',
            data: message
        });
    } catch (error) {
        console.error('Error in sendMessage:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to send message'
        });
    }
};

// Get messages for an employee
const getMessages = async (req, res) => {
    try {
        const user_id = req.user.id;

        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { type: 'broadcast' },
                    { type: 'personal', recipient_id: user_id }
                ],
                deleted_at: null
            },
            include: [{
                model: User,
                as: 'sender',
                attributes: ['id', 'username', 'name', 'role']
            }],
            order: [['created_at', 'DESC']]
        });

        res.json({
            status: 'success',
            data: messages
        });
    } catch (error) {
        console.error('Error in getMessages:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to get messages'
        });
    }
};

// Mark message as read
const markAsRead = async (req, res) => {
    try {
        const { message_id } = req.params;
        const user_id = req.user.id;

        const message = await Message.findOne({
            where: {
                id: message_id,
                [Op.or]: [
                    { type: 'broadcast' },
                    { type: 'personal', recipient_id: user_id }
                ]
            }
        });

        if (!message) {
            return res.status(404).json({
                status: 'error',
                message: 'Message not found'
            });
        }

        await message.update({ read_status: true });

        res.json({
            status: 'success',
            message: 'Message marked as read'
        });
    } catch (error) {
        console.error('Error in markAsRead:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to mark message as read'
        });
    }
};

// Delete a message (soft delete)
const deleteMessage = async (req, res) => {
    try {
        const { message_id } = req.params;
        const user = req.user;

        const message = await Message.findByPk(message_id);

        if (!message) {
            return res.status(404).json({
                status: 'error',
                message: 'Message not found'
            });
        }

        // Only admin/superadmin or the message recipient can delete
        if (user.role !== 'admin' && user.role !== 'super_admin' && 
            (message.type === 'personal' && message.recipient_id !== user.id)) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to delete this message'
            });
        }

        await message.destroy(); // Soft delete due to paranoid:true

        res.json({
            status: 'success',
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteMessage:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to delete message'
        });
    }
};

module.exports = {
    checkAdminRole,
    sendMessage,
    getMessages,
    markAsRead,
    deleteMessage
};
