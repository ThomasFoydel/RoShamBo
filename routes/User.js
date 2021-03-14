const express = require('express');
const mongoose = require('mongoose');
const API = require('../controller/API');
const router = express.Router();

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  console.log({ userId });
  console.log(typeof userId);
  try {
    userId = new mongoose.Types.ObjectId(userId);
  } catch (err) {
    return res.send({ err: 'Invalid ID' });
  }
  API.user
    .findById(userId)
    .then((user) => res.status(201).send(user))
    .catch((err) => {
      console.log('get user error: ', err);
      return res
        .status(500)
        .send({ err: 'Database is down, we are working to fix this' });
    });
});

module.exports = router;
