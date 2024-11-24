const jwt = require('jsonwebtoken');
const { User, Employee } = require('../models');

const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Special case for superadmin
    if (decoded.username === 'superadmin' && decoded.role === 'super_admin') {
      req.user = {
        id: 1, // Default ID for superadmin
        username: 'superadmin',
        role: 'super_admin'
      };
      return next();
    }

    // For regular users, get user from database with employee info
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'username', 'name', 'role', 'is_active']
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get employee info if exists
    const employee = await Employee.findOne({
      where: { user_id: user.id }
    });

    // Add user and employee info to request
    req.user = user;
    req.employee = employee;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token'
    });
  }
};

module.exports = {
  authenticateToken
};
