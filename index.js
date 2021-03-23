const express = require('express');
const mongoose = require('mongoose');
const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/Api');
const API = require('./controller/API');
require('dotenv').config();
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let users = {};

const weapons = {
  rock: { beats: ['scissors', 'bird'] },
  paper: { beats: ['tree', 'rock'] },
  scissors: { beats: ['bird', 'paper'] },
  bird: { beats: ['paper', 'tree'] },
  tree: { beats: ['rock', 'scissors'] },
};

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

      socket.on('leave-room', (roomId) => {
        socket.leave(roomId);
      });

      socket.on('join-room', ({ roomId, mySocketId, peerId }) => {
        socket.join(roomId);

        socket
          .to(roomId)
          .emit('user-connected', { mySocketId, userId: peerId });

        var roomCount = io.sockets.adapter.rooms.get(roomId).size;
        if (roomCount === 2) {
          io.to(roomId).emit('game-begin');
        } else {
          console.log('init state');
          API.friendship.findById(roomId).then(({ participants }) => {
            API.friendship.game
              .initState(roomId, participants[0], participants[1])
              .then((r) => console.log({ r }));
          });
        }
        socket.on('user-choice', ({ roomId, userId, userChoice }) => {
          API.friendship.game
            .getState(roomId)
            .then(({ gameState: { round } }) => {
              API.friendship.game
                .throwChoice(roomId, userId, userChoice, round)
                .then(({ gameState }) => {
                  console.log(
                    'CHOICE THROW RESULT, updated state: ',
                    gameState.choices[0]
                  );
                  console.log('ROUND: ', round);

                  const roundChoices = gameState.choices[gameState.round];
                  const userIds = Object.keys(roundChoices);
                  if (userIds.length === 2) {
                    const [user1, user2] = userIds;
                    const user1Choice = roundChoices[user1];
                    const user2Choice = roundChoices[user2];
                    const user1Weapon = weapons[user1Choice];
                    const user2Weapon = weapons[user2Choice];

                    function outcome(winner, loser, damage) {
                      console.log('outcome: ', { winner, loser, damage });
                      console.log('outcome gameState: ', gameState);
                      const gameOver = gameState[loser] - damage <= 0;
                      console.log('game over? ', gameOver);
                      // deal damage and increase round by one
                      API.friendship.game
                        .roundOutcome(
                          roomId,
                          loser,
                          gameState[loser] - damage,
                          gameState.round
                        )
                        .then((updated) => {
                          console.log('NEW STATE: ', updated);
                          io.to(roomId).emit('round-outcome', {
                            winner,
                            loser,
                            newState: updated.gameState,
                            gameOver,
                            [user1]: user1Choice,
                            [user2]: user2Choice,
                          });
                          //send back newState to both users
                        })
                        .catch((err) => {
                          console.log(
                            'API.friendship.game.roundOutcome ERROR: ',
                            err
                          );
                          // send back error
                        });
                    }

                    if (user1Weapon.beats.includes(user2Choice)) {
                      // user1 wins this round
                      outcome(user1, user2, 20);
                    } else if (user2Weapon.beats.includes(user1Choice)) {
                      // user2 wins this round
                      outcome(user2, user1, 20);
                    } else {
                      API.friendship.game.roundTie(roomId).then(() => {
                        io.to(roomId).emit('round-outcome', { tie: true });
                      });
                    }
                  }
                });
            });
        });

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
