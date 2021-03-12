const mongoose = require('mongoose');

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
  },
  { timestamps: true }
);

friendshipSchema.virtual('participants').get(function () {
  return [this.sender, this.receiver];
});

module.exports = mongoose.model('Friendship', friendshipSchema);
