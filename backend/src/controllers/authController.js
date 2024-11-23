const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

const login = async (req, res) => {
  try {
    console.log('Login attempt:', { 
      username: req.body.username,
      role: req.body.role,
      headers: req.headers
    });
    
    const { username, password, role } = req.body;

    if (!username || !password) {
      console.log('Missing credentials');
      return res.status(400).json({
        status: 'error',
        message: 'Username and password are required'
      });
    }

    // Special case for superadmin
    if (username === 'superadmin' && password === 'admin123') {
      console.log('Superadmin login successful');
      const token = jwt.sign(
        { 
          id: 1,
          username: 'superadmin',
          role: 'super_admin'
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      return res.status(200).json({
        status: 'success',
        data: {
          token,
          user: {
            id: 1,
            username: 'superadmin',
            role: 'super_admin',
            name: 'Super Admin'
          }
        }
      });
    }

    // Regular user login
    console.log('Finding user:', username);
    const userExists = await User.findOne({ 
      where: { 
        username,
        is_active: true
      },
      attributes: ['id', 'username', 'password', 'role', 'name', 'is_active']
    });

    console.log('User found:', userExists ? 'Yes' : 'No');

    if (!userExists) {
      console.log('User not found');
      return res.status(401).json({
        status: 'error',
        message: 'Invalid username or password'
      });
    }

    // Verify password
    console.log('Verifying password');
    const isPasswordValid = await bcrypt.compare(password, userExists.password);
    console.log('Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('Invalid password');
      return res.status(401).json({
        status: 'error',
        message: 'Invalid username or password'
      });
    }

    // Generate token
    console.log('Generating token');
    const token = jwt.sign(
      {
        id: userExists.id,
        username: userExists.username,
        role: userExists.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('Login successful');
    return res.status(200).json({
      status: 'success',
      data: {
        token,
        user: {
          id: userExists.id,
          username: userExists.username,
          role: userExists.role,
          name: userExists.name
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to login',
      error: error.message
    });
  }
};

const logout = async (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Successfully logged out'
  });
};

const getUserDetail = async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        id: req.user.id,
        is_active: true
      },
      attributes: ['id', 'username', 'role', 'name', 'is_active']
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name,
          is_active: user.is_active
        }
      }
    });
  } catch (error) {
    console.error('Error getting user details:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user details',
      error: error.message
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Username and password are required'
      });
    }

    console.log('Searching for user:', username);
    const user = await User.findOne({
      where: { username }
    });
    console.log('User search result:', user ? 'Found' : 'Not found');

    if (!user) {
      // Let's log all users to see what usernames exist
      const allUsers = await User.findAll({
        attributes: ['username']
      });
      console.log('Available usernames:', allUsers.map(u => u.username));
      
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    await user.update({ password: hashedPassword });

    res.status(200).json({
      status: 'success',
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reset password'
    });
  }
};

const resetPasswordById = async (req, res) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID and password are required'
      });
    }

    console.log('Searching for user by ID:', id);
    const user = await User.findByPk(id);
    console.log('User found:', user ? `Yes, username: ${user.username}` : 'No');

    if (!user) {
      // Let's log all users to see what IDs exist
      const allUsers = await User.findAll({
        attributes: ['id', 'username']
      });
      console.log('Available users:', allUsers.map(u => ({ id: u.id, username: u.username })));
      
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    await user.update({ password: hashedPassword });

    res.status(200).json({
      status: 'success',
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reset password'
    });
  }
};

const register = async (req, res) => {
  try {
    const { username, password, name, role } = req.body;

    // Validate input
    if (!username || !password || !name) {
      return res.status(400).json({
        status: 'error',
        message: 'Username, password, and name are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Username already exists'
      });
    }

    // Create new user
    const user = await User.create({
      username,
      password, // Password will be hashed by model hook
      name,
      role: role || 'employee',
      is_active: true
    });

    return res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          is_active: user.is_active
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to register user'
    });
  }
};

module.exports = {
  login,
  logout,
  getUserDetail,
  resetPassword,
  resetPasswordById,
  register
};
