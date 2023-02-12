const express = require('express')

const router = express.Router()

const userRouts = require('./User')
const authRouts = require('./Auth')
const forumRoutes = require('./Forum')
const imageRoutes = require('./Image')
const battleRoutes = require('./Battle')

router.use('/user', userRouts)
router.use('/auth', authRouts)
router.use('/forum', forumRoutes)
router.use('/image', imageRoutes)
router.use('/battle', battleRoutes)

module.exports = router
