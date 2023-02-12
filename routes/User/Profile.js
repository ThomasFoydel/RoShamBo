const express = require('express')
const mongoose = require('mongoose')
const API = require('../../controller/API')
const auth = require('../../middleware/auth')

const router = express.Router()

router.get('/:profileId', async (req, res) => {
  const userId = req.header('userId')
  const { profileId } = req.params
  let profileObjId
  let userObjId
  try {
    profileObjId = new mongoose.Types.ObjectId(profileId)
    if (userId !== 'null' && userId !== 'undefined') userObjId = new mongoose.Types.ObjectId(userId)
  } catch (err) {
    return res.status(404).send({ status: 'error', message: 'Invalid ID(s)' })
  }
  const existingFriendship = await API.friendship.findByUsers(userObjId, profileObjId)
  const friendshipExists = !!existingFriendship
  const userProfile = await API.user.findById(profileObjId)
  res
    .status(201)
    .send({ status: 'success', message: 'Profile found', user: userProfile, friendshipExists })
})

router.put('/', auth, (req, res) => {
  const { userId } = req.tokenUser
  const update = req.body
  API.user
    .updateProfile(userId, update)
    .then((user) => res.status(200).send({ status: 'success', message: 'Profile updated', user }))
    .catch(() =>
      res
        .status(500)
        .send({ status: 'error', message: 'Database is down, we are working to fix this' })
    )
})

module.exports = router
