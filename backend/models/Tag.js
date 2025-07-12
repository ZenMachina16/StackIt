const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a tag name'],
    unique: true,
    trim: true
  }
}, {
  timestamps: true
});

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag; 