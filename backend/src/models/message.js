const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('personal', 'broadcast'),
        allowNull: false
    },
    sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    recipient_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // null for broadcast messages
        references: {
            model: 'users',
            key: 'id'
        }
    },
    read_status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'messages',
    paranoid: true,
    timestamps: true
});

module.exports = Message;
