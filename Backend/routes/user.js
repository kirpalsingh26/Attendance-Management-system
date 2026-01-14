const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { username, profilePicture, theme, semesterStartDate, semesterEndDate } = req.body;

    const updateFields = {};
    if (username) updateFields.username = username;
    if (profilePicture) updateFields.profilePicture = profilePicture;
    if (theme) updateFields.theme = theme;
    if (semesterStartDate !== undefined) updateFields.semesterStartDate = semesterStartDate;
    if (semesterEndDate !== undefined) updateFields.semesterEndDate = semesterEndDate;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        theme: user.theme,
        authProvider: user.authProvider,
        semesterStartDate: user.semesterStartDate,
        semesterEndDate: user.semesterEndDate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/user/password
// @desc    Update password
// @access  Private
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    if (user.authProvider !== 'local') {
      return res.status(400).json({
        success: false,
        message: 'Cannot change password for OAuth accounts'
      });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
