const express = require('express')
const mongoose = require('mongoose')
const API = require('../../controller/API')
const auth = require('../../middleware/auth')

const router = express.Router()

router.post('/', auth, async (req, res) => {
  try {
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
    const existingFriendship = await API.friendship.findByUsers(senderId, receiverId)
    if (existingFriendship) {
      return res.status(404).send({ status: 'error', message: 'Friendship not found' })
    }

    const newFriendRequest = await API.friendship.create(senderId, receiverId)
    return res
      .status(201)
      .send({ status: 'success', message: 'Friend request sent', newFriendRequest })
  } catch (err) {
    return res.status(500).send({ status: 'error', message: 'Friend request creation failed' })
  }
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
  try {
    const { userId } = req.tokenUser
    const friendRequests = await API.friendship.findPending(userId)
    if (!friendRequests) {
      return res.status(404).send({ status: 'error', message: 'Friend requests not found' })
    }
    return res
      .status(200)
      .send({ status: 'success', message: 'Friend request fetch successful', friendRequests })
  } catch (err) {
    return res
      .status(500)
      .send({ status: 'error', message: 'Database is down, we are working to fix this' })
  }
})

router.get('/', auth, async ({ tokenUser: { userId } }, res) => {
  try {
    const friendships = await API.friendship.findFriendlist(userId)
    if (!friendships) {
      return res.status(404).send({ status: 'error', message: 'Friendships not found' })
    }
    return res.status(200).send({ status: 'success', message: 'Friendships found', friendships })
  } catch (err) {
    res
      .status(500)
      .send({ status: 'error', message: 'Database is down, we are working to fix this' })
  }
})

router.delete('/:friendId', auth, async ({ tokenUser: { userId }, params: { friendId } }, res) => {
  try {
    const friendship = await API.friendship.findByUsers(userId, friendId)
    if (!friendship) {
      return res.status(404).send({ status: 'error', message: 'Friendship not found' })
    }
    await API.friendship.delete(friendship._id)
    return res
      .status(200)
      .send({ status: 'success', message: 'Friendship deleted', friendshipId: friendship._id })
  } catch (err) {
    return res
      .status(500)
      .send({ status: 'error', message: 'Database is down, we are working to fix this' })
  }
})

module.exports = router
