const User = require('../models/User');
const Message = require('../models/Message');
const Friendship = require('../models/Friendship');
const Post = require('../models/Post');
const RandomBattle = require('../models/RandomBattle');
const Comment = require('../models/Comment');
const API = {
  user: {
    create: (user) => User.create(user),
    findById: (id) => User.findById(id),
    findByEmail: (email) => User.findOne({ email }).select('password email'),
  },
  message: {
    create: (sender, receiver, content) =>
      Message.create({ sender, receiver, content }),
    findById: (id) => Message.findById(id),
    findByUser: (userId) =>
      Message.find({
        participants: { $in: [userId] },
      }),
  },
  post: {
    create: async (title, content, author) => {
      let post = await Post.create({ author, title, content });
      post = await post.populate('author').execPopulate();
      return post;
    },
    delete: (id) => Post.findByIdAndDelete(id),
    findById: (id) => Post.findById(id),
    find: () =>
      Post.find({})
        .populate([
          {
            path: 'comments',
            model: 'Comment',
            populate: {
              path: 'author',
              model: 'User',
            },
          },
          { path: 'author' },
        ])
        .sort({ createdAt: 'descending' })
        .limit(100),
    addComment: (post, comment) =>
      Post.findByIdAndUpdate(
        post,
        { $push: { comments: [comment] } },
        { new: true }
      ).populate([
        {
          path: 'comments',
          model: 'Comment',
          populate: {
            path: 'author',
            model: 'User',
          },
        },
        { path: 'author' },
      ]),
    removeComment: (postId, commentId) =>
      Post.findByIdAndUpdate(
        postId,
        { $pull: { comments: commentId } },
        { new: true }
      ).populate([
        {
          path: 'comments',
          model: 'Comment',
          populate: {
            path: 'author',
            model: 'User',
          },
        },
        { path: 'author' },
      ]),
  },
  comment: {
    create: (content, author, post) =>
      Comment.create({ content, author, post }),
    find: (id) => Comment.findById(id),
    delete: (id) => Comment.findByIdAndDelete(id),
  },
  friendship: {
    create: (sender, receiver) => Friendship.create({ sender, receiver }),
    findById: (id) => Friendship.findById(id).populate('sender receiver'),
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
      Friendship.findByIdAndUpdate(id, { status: 'accepted' }, { new: true }),
    reject: (id) =>
      Friendship.findByIdAndUpdate(id, { status: 'rejected' }, { new: true }),

    battle: {
      start: (id) =>
        Friendship.findByIdAndUpdate(id, {
          $set: { 'gameState.gameRunning': true },
        }),
      getState: (id) => Friendship.findById(id).select('gameState'),
      initState: (id, user1, user2) =>
        Friendship.findByIdAndUpdate(
          id,
          {
            $set: {
              gameState: {
                gameRunning: false,
                [user1]: 100,
                [user2]: 100,
                round: 0,
                choices: [],
              },
            },
          },
          { new: true }
        ),
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
      roundOutcome: (id, loser, health, round, gameOver) => {
        const update = {
          [`gameState.${loser}`]: health,
          'gameState.round': round + 1,
        };
        if (gameOver) {
          update['gameState.gameRunning'] = false;
        }
        return Friendship.findByIdAndUpdate(
          id,
          {
            $set: update,
          },
          { new: true }
        );
      },
      roundTie: (id) =>
        Friendship.findByIdAndUpdate(id, { $inc: { 'gameState.round': 1 } }),
    },
  },
  randomBattle: {
    create: (roomId, user1, user2) =>
      RandomBattle.create({
        roomId,
        participants: [user1, user2],
        gameState: {
          [user1]: 100,
          [user2]: 100,
          gameRunning: false,
          round: 0,
          choices: [],
        },
      }),
    initState: (roomId, user1, user2) =>
      RandomBattle.findOneAndUpdate(
        { roomId },
        {
          $set: {
            gameState: {
              [user1]: 100,
              [user2]: 100,
              gameRunning: false,
              round: 0,
              choices: [],
            },
          },
        }
      ),
    findByRoomId: (roomId) => RandomBattle.findOne({ roomId }),
    gameStart: (roomId) =>
      RandomBattle.findOneAndUpdate(
        { roomId },
        { $set: { 'gameState.gameRunning': true } },
        { useFindAndModify: false }
      ),
    throwChoice: (roomId, userId, userChoice, round) =>
      RandomBattle.findOneAndUpdate(
        { roomId },
        {
          $set: {
            [`gameState.choices.${round}.${userId}`]: userChoice,
          },
        },
        { new: true, useFindAndModify: false }
      ),
    roundOutcome: (roomId, loser, health, round, gameOver) => {
      const update = {
        [`gameState.${loser}`]: health,
        'gameState.round': round + 1,
      };
      if (gameOver) {
        update['gameState.gameRunning'] = false;
      }
      return RandomBattle.findOneAndUpdate(
        { roomId },
        {
          $set: update,
        },
        { new: true, useFindAndModify: false }
      );
    },
    roundTie: (roomId) =>
      Friendship.findOneAndUpdate(
        { roomId },
        { $inc: { 'gameState.round': 1 } },
        { new: true, useFindAndModify: false }
      ),
  },
};

module.exports = API;
