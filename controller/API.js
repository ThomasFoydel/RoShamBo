const User = require('../models/User');
const Message = require('../models/Message');
const Friendship = require('../models/Friendship');
const Post = require('../models/Post');

const API = {
  user: {
    create: (user) => User.create(user),
    findById: (id) => User.findById(id),
    findByEmail: (email) => User.findOne({ email }).select('password'),
  },
  message: {
    create: ({ sender, receiver, content }) =>
      Message.create({ sender, receiver, content }),
    findById: (id) => Message.findById(id),
    findByUser: (userId) =>
      Message.find({
        participants: { $in: [userId] },
      }),
  },
  post: {
    find: () => Post.find({}).populate('author'),
    create: ({ author, title, content }) =>
      Post.create({ author, title, content }),
  },
  friendship: {
    create: (sender, receiver) => Friendship.create({ sender, receiver }),
    findById: (id) => Friendship.findById(id),
    findByReceiver: (id) => Friendship.find({ receiver: id }),
    findByUsers: (user1, user2) =>
      Friendship.findOne({
        $and: [
          { participants: { $in: [user2] } },
          { participants: { $in: [user1] } },
        ],
      }),
    findFriendlist: (id) =>
      Friendship.find({
        $and: [{ status: 'accepted' }, { participants: { $in: [id] } }],
      }).populate('sender receiver'),
    findPending: (id) =>
      Friendship.find({
        $and: [{ status: 'pending' }, { receiver: id }],
      }).populate('sender'),
    accept: (id) =>
      Friendship.findOneAndUpdate(
        { _id: id },
        { status: 'accepted' },
        { new: true }
      ),
    reject: (id) =>
      Friendship.findOneAndUpdate(
        { _id: id },
        { status: 'rejected' },
        { new: true }
      ),

    game: {
      getState: (id) => Friendship.findById(id).select('gameState'),
      initState: (id, user1, user2) =>
        Friendship.findByIdAndUpdate(
          id,
          {
            $set: {
              gameState: {
                [user1]: 100,
                [user2]: 100,
                round: 0,
                choices: [],
              },
            },
          },
          { new: true }
        ),
      // throwChoice: (id, userId, userChoice) =>
      //   Friendship.findByIdAndUpdate(
      //     id,
      //     {
      //       $push: {
      //         'gameState.choices': {
      //           [userId]: userChoice,
      //         },
      //       },
      //     },
      //     { new: true }
      //   ),
      throwChoice: (id, userId, userChoice, round) =>
        Friendship.findByIdAndUpdate(
          id,
          {
            $set: {
              [`gameState.choices.${round}.${userId}`]: userChoice,
            },
          },
          { new: true }
        ),
      roundOutcome: (id, loser, health, round) =>
        Friendship.findByIdAndUpdate(
          id,
          {
            $set: { [`gameState.${loser}`]: health, round: round + 1 },
          },
          { new: true }
        ),

      // clearChoiceState: (id) => Friendship.findByIdAndUpdate(id, {$set: {"gameState.waitingChoice":{} } })
    },
  },
};

module.exports = API;
