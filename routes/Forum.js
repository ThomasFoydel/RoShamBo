const express = require('express');
const auth = require('../middleware/auth');
const API = require('../controller/API');
const router = express.Router();

router.post('/post', auth, async (req, res) => {
  const { title, content } = req.body;
  const { userId } = req.tokenUser;
  API.post
    .create(title, content, userId)
    .then((post) => res.status(201).send(post))
    .catch(() =>
      res
        .status(500)
        .send({ err: 'Database is down, we are working to fix this' })
    );
});

router.get('/posts', async (req, res) => {
  API.post
    .findAll(req.body.skip, req.body.limit)
    .then((posts) => res.status(201).send(posts))
    .catch(() =>
      res
        .status(500)
        .send({ err: 'Database is down, we are working to fix this' })
    );
});

router.delete('/post/:postId', auth, async (req, res) => {
  const { userId } = req.tokenUser;
  const { postId } = req.params;
  const foundPost = await API.post.findById(postId);
  if (foundPost.author._id.toString() !== userId) return res.sendStatus(401);
  const deletedPost = await API.post.delete(postId);
  if (!deletedPost) res.sendStatus(501);
  res.send(deletedPost._id.toString());
});

router.post('/comment', auth, (req, res) => {
  const { content, postId } = req.body;
  const { userId } = req.tokenUser;
  API.user
    .findById(userId)
    .then((user) =>
      API.comment
        .create(content, user._id, postId)
        .then((newComment) =>
          API.post
            .addComment(postId, newComment._id)
            .then((updatedPost) => res.send(updatedPost))
        )
    );
});

router.delete('/comment/:commentId', auth, async (req, res) => {
  const { userId } = req.tokenUser;
  const { commentId } = req.params;
  const foundComment = await API.comment.find(commentId);
  if (!foundComment) return res.sendStatus(404);
  if (foundComment.author._id.toString() !== userId) return res.sendStatus(401);
  API.comment.delete(commentId).then(async () => {
    const updatedPost = await API.post.removeComment(
      foundComment.post,
      foundComment._id
    );
    if (!updatedPost) return res.sendStatus(500);
    return res.send(updatedPost);
  });
});

module.exports = router;
