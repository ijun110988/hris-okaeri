const { User } = require('../models');
const bcrypt = require('bcryptjs');

const resetPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    const requestingUser = req.user; // This will be set by authentication middleware

    // Check if requesting user is a super_admin
    if (requestingUser.role !== 'super_admin') {
      return res.status(403).json({
        status: 'error',
        message: 'Only super admin can reset passwords'
      });
    }

    // Find the user whose password needs to be reset
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await user.update({ password: hashedPassword });

    res.status(200).json({
      status: 'success',
      message: 'Password has been reset successfully'
    });

  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while resetting password'
    });
  }
};

module.exports = {
  resetPassword
};
