const express = require('express');
const auth = require('../middleware/auth');
const API = require('../controller/API');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  const { title, content } = req.body;
  const { userId } = req.tokenUser;
  API.post
    .create({ title, content, author: userId })
    .then((post) => res.status(201).send(post))
    .catch((err) => {
      console.log('new forum post error: ', err);
      return res
        .status(500)
        .send({ err: 'Database is down, we are working to fix this' });
    });
});

router.get('/', auth, async (req, res) => {
  API.post
    .find()
    .then((posts) => res.status(201).send(posts))
    .catch((err) => {
      console.log('get forum posts error: ', err);
      return res
        .status(500)
        .send({ err: 'Database is down, we are working to fix this' });
    });
});

module.exports = router;
