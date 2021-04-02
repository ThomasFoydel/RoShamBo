const express = require('express');
const mongoose = require('mongoose');
const API = require('../controller/API');
const auth = require('../middleware/auth');
const router = express.Router();

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
      if (existingFriendship) return res.sendStatus(400);
      API.friendship
        .create(senderId, receiverId)
        .then((newFriendRequest) => {
          res.status(201).send(newFriendRequest);
        })
        .catch((err) => {
          res.sendStatus(500);
        });
    });
});

router.get('/friendrequests', auth, async (req, res) => {
  const { userId } = req.tokenUser;
  API.friendship
    .findPending(userId)
    .then((friendRequests) => res.send(friendRequests))
    .catch((err) => {
      return res
        .status(500)
        .send({ err: 'Database is down, we are working to fix this' });
    });
});

router.post('/accept-fr', auth, async (req, res) => {
  const { userId } = req.tokenUser;
  const { id } = req.body;

  API.friendship
    .findById(id)
    .then((friendrequest) => {
      if (friendrequest.receiver.toString() === userId)
        API.friendship.accept(id).then(async () => {
          const remainingFriendRequests = await API.friendship.findPending(
            userId
          );
          res.status(201).send(remainingFriendRequests);
        });
    })
    .catch(() => res.sendStatus(400));
});

router.post('/reject-fr', auth, async (req, res) => {
  const { userId } = req.tokenUser;
  const { id } = req.body;
  API.friendship
    .findById(id)
    .then((friendrequest) => {
      if (friendrequest.receiver === userId)
        API.friendship.reject(id).then(async () => {
          const remainingFriendRequests = await API.friendship.findPending(
            userId
          );
          res.status(201).send(remainingFriendRequests);
        });
    })
    .catch(() => res.sendStatus(400));
});

router.get('/friendlist', auth, async ({ tokenUser: { userId } }, res) => {
  API.friendship
    .findFriendlist(userId)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch(() => res.sendStatus(500));
});

router.get('/profile/:profileId', auth, async (req, res) => {
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
      const friendshipExists = !!existingFriendShip;

      API.user
        .findById(profileObjId)
        .then((user) => res.status(201).send({ user, friendshipExists }))
        .catch(() => {
          return res.sendStatus(500);
        });
    });
});

module.exports = router;
