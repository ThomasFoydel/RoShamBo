const express = require('express')
const profileRoutes = require('./Profile')
const friendshipRoutes = require('./Friendship')

const router = express.Router()
router.use('/profiles', profileRoutes)
router.use('/friendships', friendshipRoutes)

module.exports = router
