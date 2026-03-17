const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendEmail, resetPasswordTemplate } = require('../utils/email');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check name uniqueness
    const nameExists = await User.findOne({ name: name.trim() });
    if (nameExists) {
      return res.status(400).json({ success: false, message: 'Username already taken, please choose another' });
    }

    // Check email uniqueness
    const emailExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Check if this email should be admin
    const isAdmin = email.toLowerCase().trim() === process.env.ADMIN_EMAIL?.toLowerCase();

    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password, isAdmin });

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, avatar: user.avatar }
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      const msg = field === 'name' ? 'Username already taken, please choose another' : 'Email already registered';
      return res.status(400).json({ success: false, message: msg });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ success: false, message: 'Name and password are required' });
    }

    const user = await User.findOne({ name: name.trim() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, avatar: user.avatar }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('likedLinks').populate('bookmarks');
  res.json({ success: true, user });
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, email, avatar, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (name && name !== user.name) {
      const nameExists = await User.findOne({ name: name.trim(), _id: { $ne: user._id } });
      if (nameExists) {
        return res.status(400).json({ success: false, message: 'Username already taken, please choose another' });
      }
      user.name = name.trim();
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }
      user.email = email.toLowerCase();
    }

    if (avatar !== undefined) user.avatar = avatar;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required' });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      user.password = newPassword;
    }

    await user.save();
    res.json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, avatar: user.avatar }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'HookLinks - Password Reset Request',
      html: resetPasswordTemplate(resetUrl, user.name)
    });

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Email could not be sent. Please try again.' });
  }
});

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.json({ success: true, token, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
