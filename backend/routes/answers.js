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

    // After saving the answer and before sending the response
    const User = require('../models/User');
    if (question.author.toString() !== req.user._id.toString()) {
      const questionAuthor = await User.findById(question.author);
      if (questionAuthor) {
        questionAuthor.notifications.push({
          message: `@${req.user.name} answered your question`,
          isRead: false
        });
        await questionAuthor.save();
        console.log(`Notification sent to question author (${questionAuthor.name}): @${req.user.name} answered your question`);
      }
    }

    // Populate the created answer
    const populatedAnswer = await Answer.findById(answer._id)
      .populate('author', 'name email role')
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

    // Enforce one vote per user per answer
    const alreadyVoted = answer.voters.find(v => v.user.toString() === req.user._id.toString());
    if (alreadyVoted) {
      return res.status(400).json({
        success: false,
        message: 'You have already voted on this answer'
      });
    }

    // Update vote count and add to voters
    if (type === 'up') {
      answer.votes.upvotes += 1;
    } else {
      answer.votes.downvotes += 1;
    }
    answer.voters.push({ user: req.user._id, type });

    await answer.save();

    // Return updated answer with population
    const updatedAnswer = await Answer.findById(answerId)
      .populate('author', 'name email role')
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

// @route   POST /api/answers/:answerId/comments
// @desc    Add a comment to an answer (with mentions and notifications)
// @access  Protected
router.post('/:answerId/comments', auth, async (req, res) => {
  try {
    const { answerId } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text is required' });
    }
    const answer = await Answer.findById(answerId).populate('author');
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Answer not found' });
    }
    // Parse mentions from text (e.g., @name)
    const mentionMatches = text.match(/@([a-zA-Z0-9_]+)/g) || [];
    const names = mentionMatches.map(m => m.slice(1));
    // Find mentioned users
    const User = require('../models/User');
    const mentionedUsers = await User.find({ name: { $in: names } });
    const mentionIds = mentionedUsers.map(u => u._id);
    // Add comment
    answer.comments.push({
      user: req.user._id,
      text,
      mentions: mentionIds
    });
    await answer.save();
    // Notify answer author (if not self)
    if (answer.author && answer.author._id.toString() !== req.user._id.toString()) {
      answer.author.notifications.push({
        message: `@${req.user.name} commented on your answer`,
        isRead: false
      });
      await answer.author.save();
      console.log(`Notification sent to answer author (${answer.author.name}): @${req.user.name} commented on your answer`);
    }
    // Notify mentioned users (if not self or answer author)
    for (const mentioned of mentionedUsers) {
      if (
        mentioned._id.toString() !== req.user._id.toString() &&
        (!answer.author || mentioned._id.toString() !== answer.author._id.toString())
      ) {
        mentioned.notifications.push({
          message: `@${req.user.name} mentioned you in a comment`,
          isRead: false
        });
        await mentioned.save();
        console.log(`Notification sent to mentioned user (${mentioned.name}): @${req.user.name} mentioned you in a comment`);
      }
    }
    // Return the new comment (populated)
    const populatedAnswer = await Answer.findById(answer._id).populate('comments.user', 'name');
    const newComment = populatedAnswer.comments[populatedAnswer.comments.length - 1];
    res.status(201).json({ success: true, comment: newComment });
  } catch (error) {
    console.error('Add comment error:', error.message);
    res.status(500).json({ success: false, message: 'Server error while adding comment' });
  }
});

module.exports = router; 