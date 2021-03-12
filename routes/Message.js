const express = require('express');
const auth = require('../middleware/auth');
const API = require('../controller/API');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  const { receiver, content } = req.body;
  const sender = req.tokenUser.userId;
  API.message
    .create({ sender, receiver, content })
    .then((message) => res.status(201).send(message))
    .catch((err) => {
      console.log('new message error: ', err);
      return res
        .status(500)
        .send({ err: 'Database is down, we are working to fix this' });
    });
});

module.exports = router;
