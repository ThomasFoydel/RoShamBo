const express = require('express');
const mongoose = require('mongoose');
const API = require('../controller/API');
const router = express.Router();
const auth = require('../middleware/auth');

router.get('/:profileId', auth, async (req, res) => {
  const { profileId } = req.params;
  const { userId } = req.tokenUser;
  let profileObjId;
  try {
    profileObjId = new mongoose.Types.ObjectId(profileId);
  } catch (err) {
    return res.status(404).send({ err: 'Invalid ID' });
  }

  API.friendship
    .findByUsers(userId, profileObjId)
    .then((existingFriendShip) => {
      const isFriend = !!existingFriendShip;
      API.user
        .findById(profileObjId)
        .then((user) => res.status(201).send({ user, isFriend }))
        .catch((err) => {
          console.log('get user error: ', err);
          return res.sendStatus(500);
        });
    });
});

router.post('/friendrequest', auth, async (req, res) => {
  const sender = req.tokenUser.userId;
  const receiver = req.body.id;
  let senderId;
  let receiverId;
  try {
    senderId = new mongoose.Types.ObjectId(sender);
    receiverId = new mongoose.Types.ObjectId(receiver);
  } catch (err) {
    return res.status(404).send({ err: 'Invalid ID(s)' });
  }
  API.friendship
    .findByUsers(senderId, receiverId)
    .then((existingFriendship) => {
      if (existingFriendship) res.sendStatus(404);
      API.friendship
        .create(senderId, receiverId)
        .then((newFriendRequest) => {
          res.status(201).send(newFriendRequest);
        })
        .catch(() => res.sendStatus(500));
    });
});

module.exports = router;
