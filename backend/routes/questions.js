const express = require('express');
const Question = require('../models/Question');
const User = require('../models/User');
const Tag = require('../models/Tag');
const Answer = require('../models/Answer');
const auth = require('../middleware/auth');
const { deleteQuestion } = require('../controllers/questionController');

const router = express.Router();

// @route   POST /api/questions
// @desc    Create a new question
// @access  Protected
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, tags } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    // Handle tags - create new ones if they don't exist
    let tagIds = [];
    if (tags && tags.length > 0) {
      for (let tagName of tags) {
        // Check if tag exists
        let tag = await Tag.findOne({ name: tagName.toLowerCase().trim() });
        
        // Create tag if it doesn't exist
        if (!tag) {
          tag = await Tag.create({ name: tagName.toLowerCase().trim() });
        }
        
        tagIds.push(tag._id);
      }
    }

    // Create new question
    const question = await Question.create({
      title,
      description,
      tags: tagIds,
      author: req.user._id
    });

    // Populate the created question
    const populatedQuestion = await Question.findById(question._id)
      .populate('tags', 'name')
      .populate('author', 'name email');

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      question: populatedQuestion
    });
  } catch (error) {
    console.error('Create question error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while creating question'
    });
  }
});

// @route   GET /api/questions
// @desc    List questions with pagination
// @access  Public
// @route   GET /api/questions
// @desc    List questions with pagination, filter, and search
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = req.query.filter || 'newest';  // 'newest' | 'unanswered'
    const search = req.query.search || '';
    const tagName = req.query.tag || '';

    const query = {};

    // 🔍 Search title (regex, case-insensitive)
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // 🧠 Unanswered (answers array size = 0)
    if (filter === 'unanswered') {
      query.answers = { $size: 0 };
    }

    // 🏷️ Tag filter
    if (tagName) {
      const tagDoc = await Tag.findOne({ name: tagName.toLowerCase().trim() });
      if (tagDoc) {
        query.tags = tagDoc._id;
      } else {
        // No tag found → return empty response early
        return res.json({
          success: true,
          questions: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalQuestions: 0,
            hasNextPage: false,
            hasPrevPage: false
          }
        });
      }
    }

    // 🧾 Sorting
    const sort = { createdAt: -1 }; // Always sort by newest

    // 📦 Fetch questions
    const questions = await Question.find(query)
      .populate('tags', 'name')
      .populate('author', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalQuestions = await Question.countDocuments(query);
    const totalPages = Math.ceil(totalQuestions / limit);

    return res.json({
      success: true,
      questions,
      pagination: {
        currentPage: page,
        totalPages,
        totalQuestions,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error in GET /api/questions:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching questions'
    });
  }
});


// @route   GET /api/questions/:id
// @desc    Fetch one question by ID with full population
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('tags', 'name')
      .populate('author', 'name email')
      .populate({
        path: 'answers',
        populate: {
          path: 'author',
          select: 'name email role'
        }
      })
      .populate({
        path: 'acceptedAnswer',
        populate: {
          path: 'author',
          select: 'name email role'
        }
      });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.json({
      success: true,
      question
    });
  } catch (error) {
    console.error('Get question error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching question'
    });
  }
});

// @route   PUT /api/questions/:id/accept/:answerId
// @desc    Accept an answer for a question (only by author)
// @access  Protected
router.put('/:id/accept/:answerId', auth, async (req, res) => {
  try {
    const { id: questionId, answerId } = req.params;

    // Find the question
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Check if user is the author of the question
    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the question author can accept answers'
      });
    }

    // Check if answer exists and belongs to this question
    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    if (answer.question.toString() !== questionId) {
      return res.status(400).json({
        success: false,
        message: 'Answer does not belong to this question'
      });
    }

    // Update the question with accepted answer
    question.acceptedAnswer = answerId;
    await question.save();

    // Return updated question with population
    const updatedQuestion = await Question.findById(questionId)
      .populate('tags', 'name')
      .populate('author', 'name email')
      .populate({
        path: 'acceptedAnswer',
        populate: {
          path: 'author',
          select: 'name email'
        }
      });

    res.json({
      success: true,
      message: 'Answer accepted successfully',
      question: updatedQuestion
    });
  } catch (error) {
    console.error('Accept answer error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while accepting answer'
    });
  }
});

// DELETE /api/answers/:id
router.delete('/:id', auth, deleteQuestion);

module.exports = router; 