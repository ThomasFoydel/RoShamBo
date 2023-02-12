const express = require('express')
const API = require('../controller/API')
const auth = require('../middleware/auth')

const router = express.Router()

router.get('/:friendshipId', auth, async (req, res) => {
  try {
    const { friendshipId } = req.params
    const { userId } = req.tokenUser
    const friendship = await API.friendship.findById(friendshipId)
    if (!friendship) {
      return res.status(404).send({ status: 'error', message: 'Friendship not found' })
    }
    const { participants, _id, sender, receiver } = friendship
    if (!participants.includes(userId)) {
      return res.status(401).send({ status: 'error', message: 'Not authorized' })
    }
    return res.status(200).send({
      status: 'success',
      message: 'Friendship found',
      success: true,
      roomId: _id,
      users: [sender, receiver],
    })
  } catch (err) {
    return res
      .status(500)
      .send({ status: 'error', message: 'Database is down, we are working to fix this' })
  }
})

module.exports = router
