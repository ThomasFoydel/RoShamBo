const User = require('../models/User');
const Message = require('../models/Message');
const Friendship = require('../models/Friendship');

const API = {
  user: {
    create: (user) => User.create(user),
    findById: (id) => User.findById(id),
    findByEmail: (email) => User.findOne({ email }),
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
  },
};

module.exports = API;
