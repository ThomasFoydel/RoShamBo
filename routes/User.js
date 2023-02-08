const express = require('express')
const mongoose = require('mongoose')
const API = require('../controller/API')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/friendrequest', auth, async (req, res) => {
  const sender = req.tokenUser.userId
  const receiver = req.body.id
  let senderId
  let receiverId
  try {
    senderId = new mongoose.Types.ObjectId(sender)
    receiverId = new mongoose.Types.ObjectId(receiver)
  } catch (err) {
    return res.status(404).send({ err: 'Invalid ID(s)' })
  }
  API.friendship.findByUsers(senderId, receiverId).then((existingFriendship) => {
    if (existingFriendship) return res.sendStatus(400)
    API.friendship
      .create(senderId, receiverId)
      .then((newFriendRequest) => res.status(201).send(newFriendRequest))
      .catch(() => res.sendStatus(500))
  })
})

router.get('/friendrequests', auth, async (req, res) => {
  const { userId } = req.tokenUser
  API.friendship
    .findPending(userId)
    .then((friendRequests) => res.send(friendRequests))
    .catch(() => res.status(500).send({ err: 'Database is down, we are working to fix this' }))
})

router.post('/accept-fr', auth, async (req, res) => {
  const { userId } = req.tokenUser
  const { id } = req.body
  API.friendship
    .findById(id)
    .then((friendrequest) => {
      if (friendrequest.receiver._doc._id.toString() === userId) {
        API.friendship
          .accept(id)
          .then(async () => {
            const friendRequests = await API.friendship.findPending(userId)
            const user = await API.user.withFriends(userId)
            return res.status(201).send({ friendRequests, friendList: user.friends })
          })
          .catch(() => res.sendStatus(500))
      }
    })
    .catch(() => res.sendStatus(400))
})

router.post('/reject-fr', auth, async (req, res) => {
  const { userId } = req.tokenUser
  const { id } = req.body
  API.friendship
    .findById(id)
    .then((friendrequest) => {
      if (friendrequest.receiver === userId)
        API.friendship.reject(id).then(async () => {
          const remainingFriendRequests = await API.friendship.findPending(userId)
          res.status(201).send(remainingFriendRequests)
        })
    })
    .catch(() => res.sendStatus(400))
})

router.get('/friendships', auth, async ({ tokenUser: { userId } }, res) => {
  API.friendship
    .findFriendlist(userId)
    .then((result) => res.status(200).send(result))
    .catch(() => res.sendStatus(500))
})

router.get('/friendlist', auth, async (req, res) => {
  const { userId } = req.tokenUser
  const foundUser = await API.user.withFriends(userId)
  return res.send(foundUser.friends)
})

router.get('/profile/:profileId', async (req, res) => {
  const { profileId } = req.params
  const userId = req.header('userId')
  let profileObjId
  let userObjId
  try {
    profileObjId = new mongoose.Types.ObjectId(profileId)
    if (userId !== 'null' && userId !== 'undefined') userObjId = new mongoose.Types.ObjectId(userId)
  } catch (err) {
    return res.status(404).send({ err: 'Invalid ID' })
  }
  const existingFriendship = await API.friendship.findByUsers(userObjId, profileObjId)
  const friendshipExists = !!existingFriendship
  const userProfile = await API.user.findById(profileObjId)
  res.status(201).send({ user: userProfile, friendshipExists })
})

router.put('/profile', auth, (req, res) => {
  const { userId } = req.tokenUser
  const update = req.body
  API.user
    .updateProfile(userId, update)
    .then((updatedUser) => res.send(updatedUser))
    .catch(() => res.sendStatus(500))
})

module.exports = router
