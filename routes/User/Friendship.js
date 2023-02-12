const express = require('express')
const mongoose = require('mongoose')
const API = require('../../controller/API')
const auth = require('../../middleware/auth')

const router = express.Router()

router.post('/', auth, async (req, res) => {
  const sender = req.tokenUser.userId
  const receiver = req.body.id
  let senderId
  let receiverId
  try {
    senderId = new mongoose.Types.ObjectId(sender)
    receiverId = new mongoose.Types.ObjectId(receiver)
  } catch (err) {
    return res.status(404).send({ status: 'error', message: 'Invalid ID(s)' })
  }
  API.friendship.findByUsers(senderId, receiverId).then((existingFriendship) => {
    if (existingFriendship) {
      return res.status(404).send({ status: 'error', message: 'Friendship not found' })
    }
    API.friendship
      .create(senderId, receiverId)
      .then((newFriendRequest) =>
        res
          .status(201)
          .send({ status: 'success', message: 'Friend request sent', newFriendRequest })
      )
      .catch(() =>
        res.status(500).send({ status: 'error', message: 'Friend request creation failed' })
      )
  })
})

router.put('/', auth, async (req, res) => {
  const { userId } = req.tokenUser
  const { id, accept } = req.body
  try {
    const friendrequest = await API.friendship.findById(id)
    if (!friendrequest) {
      return res.status(404).send({ status: 'error', message: 'Friend request not found' })
    }

    if (friendrequest.receiver._id.toString() !== userId) {
      return res.status(401).send({ status: 'error', message: 'Not authorized' })
    }

    await API.friendship[accept ? 'accept' : 'reject'](id)

    const friendRequests = await API.friendship.findPending(userId)
    const friendList = await API.friendship.findFriendlist(userId)

    return res.status(200).send({
      friendList,
      friendRequests,
      status: 'success',
      message: `Friend request ${accept ? 'accepted' : 'rejected'}`,
    })
  } catch (err) {
    res
      .status(500)
      .send({ status: 'error', message: 'Database is down, we are working to fix this' })
  }
})

router.get('/requests', auth, async (req, res) => {
  const { userId } = req.tokenUser
  API.friendship
    .findPending(userId)
    .then((friendRequests) =>
      res
        .status(200)
        .send({ status: 'success', message: 'Friend request fetch successful', friendRequests })
    )
    .catch(() =>
      res
        .status(500)
        .send({ status: 'error', message: 'Database is down, we are working to fix this' })
    )
})

router.get('/', auth, async ({ tokenUser: { userId } }, res) => {
  API.friendship
    .findFriendlist(userId)
    .then((friendships) =>
      res.status(200).send({ status: 'success', message: 'Friendships found', friendships })
    )
    .catch(() =>
      res
        .status(500)
        .send({ status: 'error', message: 'Database is down, we are working to fix this' })
    )
})

module.exports = router
