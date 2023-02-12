const express = require('express')
const API = require('../controller/API')
const auth = require('../middleware/auth')

const router = express.Router()

router.get('/:friendshipId', auth, async (req, res) => {
  const { friendshipId } = req.params
  const { userId } = req.tokenUser
  API.friendship
    .findById(friendshipId)
    .then(({ participants, _id, sender, receiver }) => {
      if (!participants.includes(userId)) return res.sendStatus(401)
      return res.status(200).send({
        status: 'success',
        message: 'Friendship found',
        success: true,
        roomId: _id,
        users: [sender, receiver],
      })
    })
    .catch(() =>
      res
        .status(500)
        .send({ status: 'error', message: 'Database is down, we are working to fix this' })
    )
})

module.exports = router
