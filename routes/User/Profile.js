const express = require('express')
const mongoose = require('mongoose')
const API = require('../../mongoDB/API')
const auth = require('../../middleware/auth')

const router = express.Router()

router.get('/:profileId', async (req, res) => {
  try {
    const userId = req.header('userId')
    const { profileId } = req.params
    let profileObjId
    let userObjId
    try {
      profileObjId = new mongoose.Types.ObjectId(profileId)
      if (userId !== 'null' && userId !== 'undefined')
        userObjId = new mongoose.Types.ObjectId(userId)
    } catch (err) {
      return res.status(404).send({ status: 'error', message: 'Invalid ID(s)' })
    }
    const friendship = await API.friendship.findByUsers(userObjId, profileObjId)
    const userProfile = await API.user.findById(profileObjId)
    return res
      .status(201)
      .send({ friendship, status: 'success', user: userProfile, message: 'Profile found' })
  } catch (err) {
    return res
      .status(500)
      .send({ status: 'error', message: 'Database is down, we are working to fix this' })
  }
})

router.put('/', auth, async (req, res) => {
  try {
    const { userId } = req.tokenUser
    const update = req.body
    const user = await API.user.updateProfile(userId, update)
    if (!user) return res.status(404).send({ status: 'error', message: 'User not found' })
    return res.status(200).send({ status: 'success', message: 'Profile updated', user })
  } catch (err) {
    return res
      .status(500)
      .send({ status: 'error', message: 'Database is down, we are working to fix this' })
  }
})

module.exports = router
