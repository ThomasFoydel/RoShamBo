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
  friendship: {
    create: ({ sender, receiver }) => Friendship.create({ sender, receiver }),
    findById: (id) => Friendship.findById(id),
    findByUsers: (user1, user2) =>
      Friendship.find({ participants: { $in: [user1, user2] } }),
  },
  post: {
    find: () => Post.find({}).populate('author'),
    create: ({ author, title, content }) =>
      Post.create({ author, title, content }),
  },
};

module.exports = API;
