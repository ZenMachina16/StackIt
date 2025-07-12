const express = require('express');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/answers/:questionId
// @desc    Add answer to a question
// @access  Protected
router.post('/:questionId', auth, async (req, res) => {
  try {
    const { questionId } = req.params;
    const { description } = req.body;

    // Validate required fields
    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Answer description is required'
      });
    }

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Create new answer
    const answer = await Answer.create({
      question: questionId,
      author: req.user._id,
      description
    });

    // Add answer to question's answers array
    question.answers.push(answer._id);
    await question.save();

    // Populate the created answer
    const populatedAnswer = await Answer.findById(answer._id)
      .populate('author', 'username email role')
      .populate('question', 'title');

    res.status(201).json({
      success: true,
      message: 'Answer added successfully',
      answer: populatedAnswer
    });
  } catch (error) {
    console.error('Add answer error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while adding answer'
    });
  }
});

// @route   POST /api/answers/:answerId/vote
// @desc    Vote on an answer (upvote or downvote)
// @access  Protected
router.post('/:answerId/vote', auth, async (req, res) => {
  try {
    const { answerId } = req.params;
    const { type } = req.body;

    // Validate vote type
    if (!type || !['up', 'down'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Vote type must be "up" or "down"'
      });
    }

    // Find the answer
    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({
        success: false,
        message: 'Answer not found'
      });
    }

    // Prevent author from voting on their own answer
    if (answer.author.toString() === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You cannot vote on your own answer'
      });
    }

    // Update vote count
    if (type === 'up') {
      answer.votes.upvotes += 1;
    } else {
      answer.votes.downvotes += 1;
    }

    await answer.save();

    // Return updated answer with population
    const updatedAnswer = await Answer.findById(answerId)
      .populate('author', 'username email role')
      .populate('question', 'title');

    res.json({
      success: true,
      message: `Answer ${type}voted successfully`,
      answer: updatedAnswer
    });
  } catch (error) {
    console.error('Vote answer error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while voting on answer'
    });
  }
});

module.exports = router; 