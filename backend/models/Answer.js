const mongoose = require('mongoose');

// Votes subdocument schema
const votesSchema = new mongoose.Schema({
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  }
}, { _id: false });

const answerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: [true, 'Please provide a question reference']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide an author']
  },
  description: {
    type: String,
    required: [true, 'Please provide an answer description'],
    trim: true
  },
  isAccepted: {
    type: Boolean,
    default: false
  },
  votes: {
    type: votesSchema,
    default: () => ({})
  },
  voters: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      type: { type: String, enum: ['up', 'down'] }
    }
  ],
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      text: { type: String, required: true },
      mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, {
  timestamps: true
});

const Answer = mongoose.model('Answer', answerSchema);

module.exports = Answer; 