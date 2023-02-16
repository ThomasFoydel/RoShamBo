const express = require('express')
const profileRoutes = require('./Profiles')
const friendshipRoutes = require('./Friendships')

const router = express.Router()
router.use('/profiles', profileRoutes)
router.use('/friendships', friendshipRoutes)

module.exports = router
