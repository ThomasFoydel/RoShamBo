const express = require('express')
const API = require('../../mongoDB/API')
const auth = require('../../middleware/auth')

const router = express.Router()

router.post('/', auth, async (req, res) => {
  const { content, postId } = req.body
  const { userId } = req.tokenUser
  try {
    const user = await API.user.findById(userId)
    if (!user) {
      return res.status(404).send({ status: 'error', message: 'User not found' })
    }
    const newComment = await API.comment.create(content, user._id, postId)
    if (!newComment) {
      return res.status(500).send({ status: 'error', message: 'Comment creation failed' })
    }
    const post = await API.post.addComment(postId, newComment._id)
    if (!post) {
      return res.status(500).send({ status: 'error', message: 'Comment creation failed' })
    }
    return res.status(201).send({ status: 'success', message: 'Comment created', post })
  } catch (err) {
    return res
      .status(500)
      .send({ status: 'error', message: 'Database is down, we are working to fix this' })
  }
})

router.delete('/:commentId', auth, async (req, res) => {
  const { userId } = req.tokenUser
  const { commentId } = req.params
  const foundComment = await API.comment.find(commentId)
  if (!foundComment) {
    return res.status(404).send({ status: 'error', message: 'Comment not found' })
  }
  if (foundComment.author._id.toString() !== userId) {
    return res.status(401).send({ status: 'error', message: 'Not authorized' })
  }
  const deletedComment = await API.comment.delete(commentId)
  if (!deletedComment) {
    return res.status(500).send({ status: 'error', message: 'Comment deletion failed' })
  }
  const updatedPost = await API.post.removeComment(foundComment.post, foundComment._id)
  if (!updatedPost) {
    return res.status(500).send({ status: 'error', message: 'Post not found' })
  }
  return res.status(200).send({ status: 'success', message: 'Comment deleted', updatedPost })
})

module.exports = router
