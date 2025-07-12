const Question = require('../models/Question');
const Answer = require('../models/Answer');

const getMyStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const questionCount = await Question.countDocuments({ author: userId });
    const answerCount = await Answer.countDocuments({ author: userId });

    // Get recent 5 questions and answers with descriptions
    const questions = await Question.find({ author: userId })
      .select('title')
      .sort({ createdAt: -1 })
      .limit(5);

    const answers = await Answer.find({ author: userId })
      .select('description')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        questionCount,
        answerCount,
        questions: questions.map(q => q.title),
        answers: answers.map(a => a.description),
        questionIDs: questions.map(q => q._id),
        answerIDs: answers.map(a => a._id)
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching stats'
    });
  }
};

module.exports = {
  getMyStats
};
