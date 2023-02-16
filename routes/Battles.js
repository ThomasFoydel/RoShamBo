const express = require('express')
const mongoose = require('mongoose')
const API = require('../mongoDB/API')
const auth = require('../middleware/auth')

const router = express.Router()

router.get('/:friendshipId', auth, async (req, res) => {
  try {
    const { friendshipId } = req.params
    const { userId } = req.tokenUser
    let friendshipObjId
    try {
      friendshipObjId = new mongoose.Types.ObjectId(friendshipId)
    } catch (err) {
      return res.status(400).send({ status: 'error', message: 'Invalid friendship ID' })
    }
    const friendship = await API.friendship.findById(friendshipObjId)
    if (!friendship) {
      return res.status(404).send({ status: 'error', message: 'Friendship not found' })
    }
    const { participants, _id, sender, receiver } = friendship
    if (!participants.includes(userId)) {
      return res.status(401).send({ status: 'error', message: 'Not authorized' })
    }
    return res.status(200).send({
      roomId: _id,
      success: true,
      status: 'success',
      users: [sender, receiver],
      message: 'Friendship found',
    })
  } catch (err) {
    return res
      .status(500)
      .send({ status: 'error', message: 'Database is down, we are working to fix this' })
  }
})

module.exports = router
