const mongoose = require('mongoose')

const friendshipSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      default: 'pending',
      required: true,
    },
    participants: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      required: true,
    },
    gameState: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
)

friendshipSchema.pre('save', function (next) {
  this.participants = [this.sender, this.receiver]
  next()
})

module.exports = mongoose.model('Friendship', friendshipSchema)
