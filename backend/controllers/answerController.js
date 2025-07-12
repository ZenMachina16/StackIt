const Answer = require('../models/Answer');

const deleteAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ success: false, message: 'Answer not found' });
    }

    // ✅ Check correct author
    if (answer.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await answer.deleteOne();
    res.json({ success: true, message: 'Answer deleted' });
  } catch (err) {
    console.error('Delete answer error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { deleteAnswer };
