const mongoose = require('mongoose');

const commentSchema = mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    content: {
      type: String,
      validate: {
        validator: (c) => c.length < 200,
        message: 'must be less than 200 characters',
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
