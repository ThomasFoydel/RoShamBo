const express = require('express')
const profileRoutes = require('./Profile')
const friendshipRoutes = require('./Friendship')

const router = express.Router()
router.use('/profile', profileRoutes)
router.use('/friendship', friendshipRoutes)

module.exports = router
