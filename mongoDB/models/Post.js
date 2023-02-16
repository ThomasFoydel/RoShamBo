const mongoose = require('mongoose')

const postSchema = mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    title: {
      type: String,
      validate: {
        validator: (c) => c.length < 20,
        message: 'title must be less than 20 characters',
      },
    },
    content: {
      type: String,
      validate: {
        validator: (c) => c.length < 1000,
        message: 'post content must be less than 1000 characters',
      },
    },
    comments: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Comment',
      default: [],
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Post', postSchema)
