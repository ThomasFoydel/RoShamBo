const User = require('../models/User')
const Post = require('../models/Post')
const Comment = require('../models/Comment')
const Message = require('../models/Message')
const Friendship = require('../models/Friendship')
const RandomBattle = require('../models/RandomBattle')

const API = {
  user: {
    create: (user) => User.create(user),
    findById: async (id) => {
      const user = await User.findById(id)
      if (user) {
        const friendships = await Friendship.find({
          $and: [{ status: 'accepted' }, { participants: { $in: [id] } }],
        }).populate('sender receiver')
        const friends = friendships.map((f) =>
          f.sender._id.toString() === id ? f.receiver : f.sender
        )
        return { ...user._doc, friends }
      }
      return null
    },
    findByEmail: async (email) => {
      User.findOne({ email })
      const user = await User.findOne({ email }).select('+password +email')
      if (user) {
        const friendships = await Friendship.find({
          $and: [{ status: 'accepted' }, { participants: { $in: [user._id] } }],
        }).populate('sender receiver')
        const friends = friendships.map((f) =>
          f.sender._id.toString() === id ? f.receiver : f.sender
        )
        return { ...user._doc, friends }
      }
      return null
    },
    updateProfile: (id, update) =>
      User.findByIdAndUpdate(id, { $set: update }, { new: true, useFindAndModify: false }),
    incExp: (id, exp) => User.findByIdAndUpdate(id, { $inc: { exp } }),
  },
  message: {
    create: (sender, receiver, content) =>
      Message.create({ sender, receiver, content }).then((message) =>
        Message.findById(message._id).populate('sender')
      ),
    findById: (id) => Message.findById(id),
    findByUser: (userId) => Message.find({ participants: { $in: [userId] } }),
    findByUsers: (user1, user2) =>
      Message.find({
        $and: [{ participants: { $in: [user2] } }, { participants: { $in: [user1] } }],
      }).populate('sender'),
  },
  post: {
    create: async (title, content, author) => {
      const post = await Post.create({ author, title, content })
      postWithAuthor = await post.populate('author').execPopulate()
      return postWithAuthor
    },
    delete: (id) => Post.findByIdAndDelete(id, { useFindAndModify: false }),
    findById: (id) => Post.findById(id),
    findAll: (skip = 0, limit = 100) =>
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
        .skip(skip)
        .limit(limit),
    addComment: (post, comment) =>
      Post.findByIdAndUpdate(
        post,
        { $push: { comments: [comment] } },
        { new: true, useFindAndModify: false }
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
        { new: true, useFindAndModify: false }
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
    create: (content, author, post) => Comment.create({ content, author, post }),
    find: (id) => Comment.findById(id),
    findByPostId: (postId) => Comment.find({ post: postId }),
    delete: (id) => Comment.findByIdAndDelete(id, { useFindAndModify: false }),
  },
  friendship: {
    create: (sender, receiver) => Friendship.create({ sender, receiver }),
    findById: (id) => Friendship.findById(id).populate('sender receiver'),
    findByReceiver: (id) => Friendship.find({ receiver: id }),
    findByUsers: (user1, user2) =>
      Friendship.findOne({
        $and: [{ participants: { $in: [user1] } }, { participants: { $in: [user2] } }],
      }),
    findFriendlist: (id) =>
      Friendship.find({ $and: [{ status: 'accepted' }, { participants: { $in: [id] } }] }).populate(
        'sender receiver'
      ),
    findPending: (id) =>
      Friendship.find({ $and: [{ status: 'pending' }, { receiver: id }] }).populate('sender'),
    delete: (id) => Friendship.findByIdAndDelete(id),
    accept: (id) =>
      Friendship.findByIdAndUpdate(
        id,
        { status: 'accepted' },
        { new: true, useFindAndModify: false }
      ),
    reject: (id) =>
      Friendship.findByIdAndUpdate(
        id,
        { status: 'rejected' },
        { new: true, useFindAndModify: false }
      ),

    battle: {
      start: (id) =>
        Friendship.findByIdAndUpdate(
          id,
          { $set: { 'gameState.gameRunning': true } },
          { useFindAndModify: false }
        ),
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
          { new: true, useFindAndModify: false }
        ),
      throwChoice: (id, userId, userChoice, round) =>
        Friendship.findByIdAndUpdate(
          id,
          { $set: { [`gameState.choices.${round}.${userId}`]: userChoice } },
          { new: true, useFindAndModify: false }
        ),
      roundOutcome: (id, loser, health, round, gameOver) => {
        const update = { [`gameState.${loser}`]: health, 'gameState.round': round + 1 }
        if (gameOver) update['gameState.gameRunning'] = false

        return Friendship.findByIdAndUpdate(
          id,
          { $set: update },
          { new: true, useFindAndModify: false }
        )
      },
      roundTie: (id) =>
        Friendship.findByIdAndUpdate(
          id,
          { $inc: { 'gameState.round': 1 } },
          { useFindAndModify: false }
        ),
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
        },
        { useFindAndModify: false }
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
        { $set: { [`gameState.choices.${round}.${userId}`]: userChoice } },
        { new: true, useFindAndModify: false }
      ),
    roundOutcome: (roomId, loser, health, round, gameOver) => {
      const update = { [`gameState.${loser}`]: health, 'gameState.round': round + 1 }
      if (gameOver) update['gameState.gameRunning'] = false

      return RandomBattle.findOneAndUpdate(
        { roomId },
        { $set: update },
        { new: true, useFindAndModify: false }
      )
    },
    roundTie: (roomId) =>
      Friendship.findOneAndUpdate(
        { roomId },
        { $inc: { 'gameState.round': 1 } },
        { new: true, useFindAndModify: false }
      ),
  },
}

module.exports = API
