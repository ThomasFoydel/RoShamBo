const mongoose = require('mongoose');
let Friendship;
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
);

friendshipSchema.pre('save', function (next) {
  this.participants = [this.sender, this.receiver];
  next();
});

Friendship = mongoose.model('Friendship', friendshipSchema);
module.exports = Friendship;
