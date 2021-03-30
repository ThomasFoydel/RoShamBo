const mongoose = require('mongoose');
let RandomBattle;
const randomBattleSchema = mongoose.Schema(
  {
    roomId: {
      type: String,
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

RandomBattle = mongoose.model('RandomBattle', randomBattleSchema);
module.exports = RandomBattle;
