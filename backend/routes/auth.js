const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        profilePicture: req.user.profilePicture,
        bio: req.user.bio,
        location: req.user.location,
        profileVisibility: req.user.profileVisibility,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/auth/me
// @desc    Update current user profile
// @access  Private
router.put('/me', auth, async (req, res) => {
  try {
    const updates = {
      bio: req.body.bio,
      location: req.body.location,
      profileVisibility: req.body.profileVisibility,
      profilePicture: req.body.profilePicture, // Can be a URL or base64
    };

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/auth/notifications
// @desc    Get current user's notifications
// @access  Private
router.get('/notifications', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ notifications: user.notifications });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// @route   GET /api/auth/notifications/debug
// @desc    Debug: Get current user's notifications (all)
// @access  Private
router.get('/notifications/debug', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ notifications: user.notifications });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications (debug)' });
  }
});

// @route   PATCH /api/auth/notifications/mark-read
// @desc    Mark all notifications as read for the current user
// @access  Private
router.patch('/notifications/mark-read', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.notifications.forEach(n => n.isRead = true);
    await user.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error marking notifications as read' });
  }
});

module.exports = router;