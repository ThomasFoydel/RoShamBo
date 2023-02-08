const express = require('express')

const router = express.Router()

const authRouts = require('./Auth')
const userRouts = require('./User')
const forumRoutes = require('./Forum')
const imageRoutes = require('./Image')
const battleRoutes = require('./Battle')

router.use('/auth', authRouts)
router.use('/user', userRouts)
router.use('/forum', forumRoutes)
router.use('/image', imageRoutes)
router.use('/battle', battleRoutes)

module.exports = router
