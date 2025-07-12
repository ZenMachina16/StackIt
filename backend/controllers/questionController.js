const Question = require('../models/Question');

const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    // ✅ Ensure the user owns the question (assuming 'author' field)
    if (question.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await question.deleteOne();

    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (err) {
    console.error('Delete question error:', err.message);
    res.status(500).json({ success: false, message: 'Server error while deleting question' });
  }
};

module.exports = { deleteQuestion };
