const express = require('express');
const mongoose = require('mongoose');
const socketio = require('socket.io');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes');
const API = require('./controller/API');
require('dotenv').config();
const app = express();
const auth = require('./middleware/auth');

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let users = {};
let randomPool = [];

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

    app.get('/api/message/thread/:friendId', auth, (req, res) => {
      const { userId } = req.tokenUser;
      const { friendId } = req.params;
      API.message.findByUsers(userId, friendId).then((messages) => {
        res.send(messages);
      });
    });

    io.on('connection', (socket) => {
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
          console.log('jwt decoding error err: ', err);
        }
      }

      app.post('/api/message/new', auth, async (req, res) => {
        const { receiver, content } = req.body;
        const sender = req.tokenUser.userId;
        API.message
          .create(sender, receiver, content)
          .then((message) => {
            if (users[receiver]) {
              io.to(users[receiver]).emit('chat-message-notification', message);
              io.to(users[receiver]).emit('chat-message', message);
            }
            if (users[sender]) {
              io.to(users[sender]).emit('chat-message', message);
            }
            return res.status(201).send(message);
          })
          .catch(() => {
            return res
              .status(500)
              .send({ err: 'Database is down, we are working to fix this' });
          });
      });

      socket.on('join-random-pool', ({ peerId, socketId, token }) => {
        let userId;
        if (!token) {
          return console.log('no token auth denied');
        } else {
          try {
            const decoded = jwt.verify(token, process.env.SECRET);
            let current_time = Date.now() / 1000;
            if (decoded.exp < current_time) {
              /* token is expired, not authorized */
            } else {
              userId = decoded.tokenUser.userId;
            }
          } catch (err) {
            return console.log('err: ', err);
          }
        }
        API.user.findById(userId).then((user) => {
          if (!user) return;
          io.to(socket.id).emit('randombattle-pooljoined');
          randomPool = randomPool.filter(
            (entry) => entry.userId.toString() !== user._id.toString()
          );
          const newUser = {
            userId: user._id,
            socket: socket,
            socketId,
            peerId,
            name: user.name,
          };
          randomPool.push(newUser);
          if (randomPool.length > 1) {
            // other user in queue
            const user1 = randomPool.shift();
            const user2 = randomPool.shift();
            const roomId = `Random${user1.userId}VS${user2.userId}`;
            user1.socket.join(roomId);
            user2.socket.join(roomId);

            function sendConnectionSignals() {
              io.to(user2.socketId).emit('randombattle-opponentinfo', {
                rando: {
                  userId: user1.userId,
                  name: user1.name,
                },
                roomId,
              });
              io.to(user1.socketId).emit('randombattle-userconnect', {
                roomId,
                rando: {
                  userId: user2.userId,
                  peerId: user2.peerId,
                  name: user2.name,
                },
              });
            }
            API.randomBattle.findByRoomId(roomId).then((foundBattle) => {
              if (!foundBattle || foundBattle.length === 0) {
                API.randomBattle
                  .create(roomId, user1.userId, user2.userId)
                  .then(() => sendConnectionSignals());
              } else {
                API.randomBattle
                  .initState(roomId, user1.userId, user2.userId)
                  .then(() => sendConnectionSignals());
              }
            });
          }
        });
      });

      socket.on('randombattle-connectioncomplete', ({ roomId }) => {
        // both users have connected via peerjs, send begin signal
        io.to(roomId).emit('randombattle-gamebegin');
      });

      socket.on('randombattle-userchoice', ({ roomId, userId, userChoice }) => {
        API.randomBattle.findByRoomId(roomId).then(({ gameState }) => {
          API.randomBattle
            .throwChoice(roomId, userId, userChoice, gameState.round)
            .then(({ gameState }) => {
              const roundChoices = gameState.choices[gameState.round];
              const userIds = Object.keys(roundChoices);
              if (userIds.length === 2) {
                const [user1, user2] = userIds;
                const user1Choice = roundChoices[user1];
                const user2Choice = roundChoices[user2];
                const user1Weapon = weapons[user1Choice];
                const user2Weapon = weapons[user2Choice];

                function outcome(winner, loser, damage) {
                  const gameOver = gameState[loser] - damage <= 0;

                  const losersNewHealth =
                    gameState[loser] - damage > 0
                      ? gameState[loser] - damage
                      : 0;

                  API.randomBattle
                    .roundOutcome(
                      roomId,
                      loser,
                      losersNewHealth,
                      Number(gameState.round),
                      gameOver
                    )
                    .then((updated) => {
                      io.to(roomId).emit('randombattle-roundoutcome', {
                        winner,
                        loser,
                        newState: updated.gameState,
                        gameOver,
                        [user1]: user1Choice,
                        [user2]: user2Choice,
                      });
                    });
                }

                if (user1Weapon.beats.includes(user2Choice)) {
                  // user1 wins this round
                  outcome(user1, user2, 20);
                } else if (user2Weapon.beats.includes(user1Choice)) {
                  // user2 wins this round
                  outcome(user2, user1, 20);
                } else {
                  API.randomBattle.roundTie(roomId).then(() => {
                    io.to(roomId).emit('randombattle-roundoutcome', {
                      tie: true,
                      tieWeapon: user1Choice,
                    });
                  });
                }
              }
            });
        });
      });

      socket.on('randombattle-message', ({ content, name, roomId }) => {
        io.to(roomId).emit('randombattle-message', { content, name });
      });

      socket.on('leave-randomroom', (roomId) => {
        socket.to(roomId).emit('rando-left-the-building');
        socket.leave(roomId);
      });

      socket.on('randombattle-playagain', (roomId) => {
        const roomCount = io.sockets.adapter.rooms.get(roomId).size;
        if (roomCount === 2) {
          API.randomBattle
            .findByRoomId(roomId)
            .then(({ participants, gameState: { round } }) => {
              if (round !== 0) {
                API.randomBattle
                  .initState(roomId, participants[0], participants[1])
                  .then(() => io.to(roomId).emit('randombattle-gamebegin'));
              }
            });
        }
      });

      socket.on('play-again', (roomId) => {
        const roomCount = io.sockets.adapter.rooms.get(roomId).size;
        if (roomCount === 2) {
          API.friendship
            .findById(roomId)
            .then(({ participants, gameState: { round } }) => {
              if (round !== 0) {
                API.friendship.battle
                  .initState(roomId, participants[0], participants[1])
                  .then(() => io.to(roomId).emit('game-begin'));
              }
            });
        }
      });

      socket.on('leave-room', (roomId) => {
        socket.leave(roomId);
      });

      socket.on('friendbattle-message', ({ content, name, roomId }) => {
        io.to(roomId).emit('friendbattle-message', { content, name });
      });

      socket.on('join-room', ({ roomId, mySocketId, peerId }) => {
        socket.join(roomId);

        socket
          .to(roomId)
          .emit('user-connected', { mySocketId, userId: peerId });

        const roomCount = io.sockets.adapter.rooms.get(roomId).size;
        if (roomCount === 2) {
          API.friendship.findById(roomId).then((foundFriendship) => {
            if (foundFriendship.gameState.gameRunning) {
              io.to(socket.id).emit('game-resume', foundFriendship.gameState);
            } else {
              API.friendship.battle
                .start(roomId)
                .then(() => io.to(roomId).emit('game-begin'));
            }
          });
        } else {
          API.friendship
            .findById(roomId)
            .then(({ participants }) =>
              API.friendship.battle.initState(
                roomId,
                participants[0],
                participants[1]
              )
            );
        }
        socket.on('user-choice', ({ roomId, userId, userChoice }) => {
          API.friendship.battle.getState(roomId).then(({ gameState }) => {
            API.friendship.battle
              .throwChoice(roomId, userId, userChoice, gameState.round)
              .then(({ gameState }) => {
                const roundChoices = gameState.choices[gameState.round];
                const userIds = Object.keys(roundChoices);
                if (userIds.length === 2) {
                  const [user1, user2] = userIds;
                  const user1Choice = roundChoices[user1];
                  const user2Choice = roundChoices[user2];
                  const user1Weapon = weapons[user1Choice];
                  const user2Weapon = weapons[user2Choice];

                  function outcome(winner, loser, damage) {
                    const gameOver = gameState[loser] - damage <= 0;

                    const losersNewHealth =
                      gameState[loser] - damage > 0
                        ? gameState[loser] - damage
                        : 0;

                    API.friendship.battle
                      .roundOutcome(
                        roomId,
                        loser,
                        losersNewHealth,
                        Number(gameState.round),
                        gameOver
                      )
                      .then((updated) => {
                        io.to(roomId).emit('round-outcome', {
                          winner,
                          loser,
                          newState: updated.gameState,
                          gameOver,
                          [user1]: user1Choice,
                          [user2]: user2Choice,
                        });
                      });
                  }

                  if (user1Weapon.beats.includes(user2Choice)) {
                    // user1 wins this round
                    outcome(user1, user2, 20);
                  } else if (user2Weapon.beats.includes(user1Choice)) {
                    // user2 wins this round
                    outcome(user2, user1, 20);
                  } else {
                    API.friendship.battle.roundTie(roomId).then(() => {
                      io.to(roomId).emit('round-outcome', {
                        tie: true,
                        tieWeapon: user1Choice,
                      });
                    });
                  }
                }
              });
          });
        });

        socket.on('disconnect-room', (id) => {
          socket.to(roomId).emit('user-disconnected', id);
        });

        socket.on('disconnect', () => {
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
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static('client/build'));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
      });
    }
  })
  .catch((err) => {
    console.log('database connection error: ', err);
  });
