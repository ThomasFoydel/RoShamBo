const mongoose = require('mongoose')

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
)

module.exports = mongoose.model('RandomBattle', randomBattleSchema)
