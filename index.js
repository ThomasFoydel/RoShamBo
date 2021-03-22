const express = require('express');
const mongoose = require('mongoose');
const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/Api');
require('dotenv').config();
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let users = {};

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    const expressServer = app.listen(process.env.PORT || 8000);
    const io = socketio(expressServer);

    app.use('/api', apiRoutes);

    app.post('/api/message', (req, res) => {
      let { userId, message, sender } = req.body;
      const newMessage = new Message({
        sender,
        receiver: userId,
        content: message,
      });
      newMessage
        .save()
        .then((result) => {
          let receiver = users[userId];
          if (receiver) io.to(receiver.socketId).emit('chat-message', result);
          res.send(result);
        })
        .catch(() => res.send({ err: 'message error' }));
    });

    if (process.env.NODE_ENV === 'production') {
      app.use(express.static('client/build'));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
      });
    }

    io.on('connection', (socket) => {
      /* set up initial connection for chat and notifications */
      const token = socket.handshake.query.token;
      if (!token) {
        console.log('no token auth denied');
      } else {
        try {
          const decoded = jwt.verify(token, process.env.SECRET);
          let current_time = Date.now() / 1000;
          if (decoded.exp < current_time) {
            /* token is expired, not authorized */
          } else {
            let { userId } = decoded.tokenUser;
            socket.userId = userId;

            users[userId] = socket.id;
          }
        } catch (err) {
          console.log('err: ', err);
        }
      }

      socket.on('join-room', ({ roomId, mySocketId, peerId }) => {
        socket.join(roomId);

        socket
          .to(roomId)
          .emit('user-connected', { mySocketId, userId: peerId });

        socket.on('message', (message) => {
          io.to(roomId).emit('create-message', message);
        });

        socket.on('disconnect-room', (id) => {
          socket.to(roomId).emit('user-disconnected', id);
        });

        socket.on('disconnect', (id) => {
          socket.to(roomId).emit('user-disconnected', socket.userId);
          delete users[socket.userId];
        });
      });

      socket.on('disconnect', () => {
        delete users[socket.userId];
      });

      socket.on('sending-signal', ({ newUser, callerId, signal }) => {
        io.to(newUser).emit('user-joined', { callerId, signal });
      });

      socket.on('returning signal', ({ callerId, signal, returningPeer }) => {
        io.to(callerId).emit('receiving returned signal', {
          signal: signal,
          id: socket.id,
          returningPeer,
        });
      });
    });
  })
  .catch((err) => {
    console.log('database connection error: ', err);
  });
