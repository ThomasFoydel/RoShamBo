const mongoose = require('mongoose')

const messageSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    participants: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      validate: {
        validator: (c) => c.length <= 500,
        message: 'Message cannot exceed 500 characters',
      },
    },
  },
  { timestamps: true }
)

messageSchema.pre('save', function (next) {
  this.participants = [this.sender, this.receiver]
  next()
})

module.exports = mongoose.model('Message', messageSchema)
