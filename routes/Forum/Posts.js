const express = require('express')
const API = require('../../controller/API')
const auth = require('../../middleware/auth')

const router = express.Router()

router.post('/', auth, async (req, res) => {
  try {
    const { title, content } = req.body
    const { userId } = req.tokenUser
    const post = await API.post.create(title, content, userId)
    return res.status(201).send({ status: 'success', message: 'Post created', post })
  } catch (err) {
    res
      .status(500)
      .send({ status: 'error', message: 'Database is down, we are working to fix this' })
  }
})

router.get('/', async (_, res) => {
  try {
    const posts = await API.post.findAll()
    if (!posts) return res.status(404).send({ status: 'error', message: 'Posts not found' })
    return res.status(200).send({ status: 'success', message: 'Posts found', posts })
  } catch (err) {
    return res
      .status(500)
      .send({ status: 'error', message: 'Database is down, we are working to fix this' })
  }
})

router.delete('/:postId', auth, async (req, res) => {
  try {
    const { userId } = req.tokenUser
    const { postId } = req.params
    const foundPost = await API.post.findById(postId)
    if (foundPost.author._id.toString() !== userId) {
      return res.status(401).send({ status: 'error', message: 'Not authorized' })
    }
    const commentsOnPost = await API.comment.findByPostId(foundPost._id)
    await Promise.all(commentsOnPost.map(async (c) => API.comment.delete(c._id)))
    const deletedPost = await API.post.delete(postId)
    if (!deletedPost) {
      return res.status(501).send({ status: 'error', message: 'Post deletion failed' })
    }
    return res
      .status(200)
      .send({ status: 'success', message: 'Post deleted', postId: deletedPost._id.toString() })
  } catch (err) {
    return res
      .status(500)
      .send({ status: 'error', message: 'Database is down, we are working to fix this' })
  }
})

module.exports = router
