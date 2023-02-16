const express = require('express')
const postRoutes = require('./Posts')
const commentRoutes = require('./Comments')

const router = express.Router()
router.use('/posts', postRoutes)
router.use('/comments', commentRoutes)

module.exports = router
