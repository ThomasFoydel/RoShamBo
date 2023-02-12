const express = require('express')

const router = express.Router()

const userRouts = require('./User')
const authRouts = require('./Auth')
const forumRoutes = require('./Forum')
const imageRoutes = require('./Images')
const battleRoutes = require('./Battles')

router.use('/user', userRouts)
router.use('/auth', authRouts)
router.use('/forum', forumRoutes)
router.use('/images', imageRoutes)
router.use('/battles', battleRoutes)

module.exports = router
