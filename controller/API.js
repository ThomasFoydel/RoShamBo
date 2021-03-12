const User = require('../models/User');
const Message = require('../models/Message');
const Friendship = require('../models/Friendship');
const API = {
  user: {
    create: (user) => User.create(user),
    getById: (id) => User.findById(id),
    getByEmail: (email) => User.findOne({ email }),
  },
  message: {
    create: ({ sender, receiver, content }) =>
      Message.create({ sender, receiver, content }),
    getById: (id) => Message.findById(id),
    getByUser: (userId) =>
      Message.find({
        participants: { $in: [userId] },
      }),
  },
  friendship: {
    create: ({ sender, receiver }) => Friendship.create({ sender, receiver }),
    getById: (id) => Friendship.findById(id),
  },
};

module.exports = API;
