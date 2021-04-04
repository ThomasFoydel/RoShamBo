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

router.get('/posts', auth, async (req, res) => {
  API.post
    .find()
    .then((posts) => res.status(201).send(posts))
    .catch(() =>
      res
        .status(500)
        .send({ err: 'Database is down, we are working to fix this' })
    );
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

module.exports = router;
