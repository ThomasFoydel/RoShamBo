import React, { useState, useEffect, useRef, useContext } from 'react';
import * as tf from '@tensorflow/tfjs'; // eslint-disable-line
import axios from 'axios';
import Peer from 'peerjs';
import * as handpose from '@tensorflow-models/handpose';
import * as fp from 'fingerpose';
import gestures from './gestures';
import Webcam from 'react-webcam';
import { makeStyles, Grid } from '@material-ui/core';
import { Stop, PlayArrow, Mic, MicOff } from '@material-ui/icons';
import { CTX } from 'context/Store';
import weaponImgs from 'imgs/weapons';
import loadingblue from 'imgs/loadingblue.gif';

import weaponAudio from 'audio/weapons';
import soundFx from 'audio/fx';

const playSound = (s) => {
  s.currentTime = 0;
  s.play();
};

const useStyles = makeStyles((theme) => ({
  playerContainer: {
    height: '100%',
    maxHeight: '100%',
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '0 .4rem',
    background: theme.palette.primary.dark,
    border: `2px solid ${theme.palette.primary.dark}`,
    [theme.breakpoints.down('sm')]: {
      height: 'inherit',
      border: 'none',
      padding: '0',
    },
  },
  videoContainer: {
    position: 'relative',
    display: 'flex',
    minHeight: '80%',
    maxHeight: '80%',
    borderRadius: '3rem 3rem 0 0',
    overflow: 'hidden',
  },
  myVideo: {
    width: '100%',
    display: 'block',
    maxWidth: '100%',
    minHeight: '100%',
    maxHeight: '100%',
    objectFit: 'cover',
  },

  friendVideo: {
    width: '100%',
    display: 'block',
    minWidth: '100%',
    maxHeight: '100%',
    minHeight: '100%',
    objectFit: 'cover',

    transition: 'all .8s ease',
  },
  iconLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
  },

  friendChoiceIcon: {
    width: '70%',
    minHeight: '0%',
    minWidth: '70%',
  },
  myChoiceIcon: {
    width: '70%',
    transform: 'scaleX(-1)',
    minHeight: '0%',
  },

  healthbarContainer: {
    ...theme.healthbarContainer,
    borderRadius: '0 0 3rem 3rem',
    overflow: 'hidden',
    width: '100%',
  },
  healthbar: {
    ...theme.healthbar,
    minHeight: '20%',
  },
  playerName: {
    textAlign: 'center',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translateX(-50%) translateY(-50%)',
    fontFamily: 'OpenDyslexic',
    fontSize: '2rem',
    letterSpacing: '.2rem',
    color: 'white',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
  },
  controls: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    display: 'flex',
  },
  controlBtn: {
    width: '5.7rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    justifyContent: 'space-between',
    padding: '.1rem .2rem',
    cursor: 'pointer',
    fontFamily: 'OpenDyslexic',
    fontWeight: 'bold',
    margin: '.2rem .1rem',
  },
  messenger: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    maxWidth: '100%',
  },
  messages: {
    textAlign: 'left',
    background: 'rgba(255,255,255,0.2)',
    height: '11rem',
    overflowY: 'scroll',
    maxWidth: '100%',
  },
  message: {
    background: 'rgba(0,0,0,0.3)',
    padding: '.1rem .2rem',
    margin: '.2rem .1rem',
    lineHeight: '1.3rem',
  },
  dialogSection: {
    minHeight: '4rem',
    background: 'purple',
    color: 'white',
    fontFamily: 'OpenDyslexic',
    textAlign: 'center',
    fontSize: '1rem',
  },
  dialog: { justifyContent: 'space-between', height: '100%', maxWidth: '100%' },
  dialogTitle: {
    fontSize: '1.2rem',
    padding: '0 .2rem',
    maxWidth: '100%',
  },
  chooseMessage: {
    color: 'white',
    position: 'absolute',
    fontSize: '2.5rem',
    textAlign: 'center',
    fontFamily: 'OpenDyslexic',
    top: '50%',
    width: '100%',
    transform: 'translateY(-50%)',
  },
  messageInput: {
    padding: '.5rem .2rem',
    fontFamily: 'OpenDyslexic',
    zIndex: '2',
  },
  friendBattle: {
    background: 'black',
    paddingBottom: '20rem',
  },
  game: {},
  results: {
    maxWidth: '100%',
  },
  playAgainBtn: {
    padding: '.1rem .2rem',
    fontFamily: 'OpenDyslexic',
    cursor: 'pointer',
  },
}));

const FriendBattle = ({ props: { socketRef, match } }) => {
  const [
    {
      user: { name, id },
      auth: { token },
    },
  ] = useContext(CTX);

  const [displayFriend, setDisplayFriend] = useState(true);
  const classes = useStyles();
  const socket = socketRef.current;

  const { friendshipId } = match.params;
  const myCamRef = useRef();
  const myStreamRef = useRef();
  const friendVideoRef = useRef();
  const [friendStream, setFriendStream] = useState(null);
  const [friendData, setFriendData] = useState({});

  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);
  const scrollRef = useRef();
  const myPeer = useRef();
  const [handPoseNet, setHandPoseNet] = useState(null);
  const [count, setCount] = useState(null);

  const [winner, setWinner] = useState(null);
  const [myHealth, setMyHealth] = useState(100);
  const [friendHealth, setFriendHealth] = useState(100);
  const [myChoice, setMyChoice] = useState(null);
  const [friendChoice, setFriendChoice] = useState(null);
  const [inputFlowRunning, setInputFlowRunning] = useState(false);
  const [roundProcessing, setRoundProcessing] = useState(false);
  const [icons, setIcons] = useState({ video: false, audio: false });

  useEffect(() => {
    return () => {
      socket.off('user-connected');
      socket.off('friendbattle-message');
      socket.off('user-disconnected');
      socket.off('game-begin');
      socket.off('round-outcome');
      socket.off('game-resume');
      socket.emit('leave-room', friendshipId);
    };
  }, []);

  const detect = async (net) => {
    if (
      typeof myCamRef.current !== 'undefined' &&
      myCamRef.current !== null &&
      myCamRef.current.video.readyState === 4
    ) {
      const video = myCamRef.current.video;
      // Detect hand
      if (!net) return;
      const hand = await net.estimateHands(video);
      // If there's a hand estimate gesture
      if (hand.length > 0) {
        const GE = new fp.GestureEstimator([
          gestures.scissors,
          gestures.rock,
          gestures.paper,
          gestures.bird,
          gestures.tree,
        ]);
        const gesture = await GE.estimate(hand[0].landmarks, 4);
        if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
          const confidence = gesture.gestures.map(
            (prediction) => prediction.confidence
          );
          const maxConfidence = confidence.indexOf(
            Math.max.apply(null, confidence)
          );
          return gesture.gestures[maxConfidence].name;
        }
      } else {
        return null;
      }
    }
  };

  useEffect(() => {
    if (count === null) return;
    if (count > 0) {
      const getHandPose = async () => {
        const myChoice = await detect(handPoseNet);
        if (myChoice) setMyChoice(myChoice);
      };
      getHandPose();

      setTimeout(() => {
        setCount((c) => c - 1);
      }, 1000);
    } else {
      if (!myChoice) return setCount(10);
      socket.emit('user-choice', {
        roomId: friendshipId,
        userId: id,
        userChoice: myChoice,
      });
      setCount(null);
    }
  }, [count]);

  const getRoundInput = () => {
    setFriendChoice(null);
    setDisplayFriend(false);
    setCount(10);
  };

  useEffect(() => {
    return async () => {
      if (socket) socket.emit('disconnect-room', socket.id);
      if (myPeer.current) myPeer.current.destroy();
    };
  }, [token]);
  useEffect(() => {
    return () =>
      myStreamRef.current &&
      myStreamRef.current.getTracks().forEach((track) => track.stop());
  }, []);

  const playStop = () => {
    if (myStreamRef.current) {
      let enabled = myStreamRef.current.getVideoTracks()[0].enabled;
      setIcons({ ...icons, video: !icons.video });
      if (enabled) myStreamRef.current.getVideoTracks()[0].enabled = false;
      else myStreamRef.current.getVideoTracks()[0].enabled = true;
    }
  };

  const toggleMute = () => {
    if (myStreamRef.current) {
      if (myStreamRef.current.getAudioTracks().length === 0) return;
      const enabled = myStreamRef.current.getAudioTracks()[0].enabled;
      setIcons({ ...icons, audio: !icons.audio });
      if (enabled) myStreamRef.current.getAudioTracks()[0].enabled = false;
      else myStreamRef.current.getAudioTracks()[0].enabled = true;
    }
  };

  const handleSubmit = () => {
    if (!chatInput) return;
    socket.emit('friendbattle-message', {
      content: chatInput,
      name,
      roomId: friendshipId,
    });
    setChatInput('');
  };
  const handleChatInput = (e) => {
    let { value } = e.target;
    setChatInput(value);
  };
  const handleKeyDown = (e) => {
    if (e.charCode === 13) {
      handleSubmit();
    }
  };

  function scrollToBottom() {
    scrollRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start',
    });
  }

  useEffect(() => {
    if (messages && scrollRef.current) {
      scrollToBottom();
    }
  }, [messages]);

  const handleUserMedia = (stream) => {
    async function loadHandPose() {
      const net = await handpose.load();
      setHandPoseNet(net);
    }
    loadHandPose();

    axios
      .get(`/api/battle/connect/${friendshipId}`, {
        headers: { 'x-auth-token': token },
      })
      .then(async ({ data }) => {
        myPeer.current = new Peer();
        for (let user of data.users) user._id !== id && setFriendData(user);

        myPeer.current.on('open', (peerId) => {
          socket.emit('join-room', {
            peerId: peerId,
            mySocketId: socket.id,
            roomId: data.roomId,
            token: token,
          });
        });

        myStreamRef.current = stream;

        myPeer.current.on('call', function (call) {
          call.answer(stream, { metadata: socket.id });
          call.on('stream', function (callStream) {
            setFriendStream(callStream);
          });
        });

        socket.on('user-connected', ({ userId, mySocketId }) => {
          if (userId) connectToNewUser(userId, stream, mySocketId);
        });

        socket.on('friendbattle-message', (message) =>
          setMessages((messages) => [...messages, message])
        );

        socket.on('user-disconnected', () => {
          if (friendVideoRef.current) friendVideoRef.current.close();
          friendVideoRef.current = null;
          setFriendStream(null);
        });

        const loadState = (gameState) => {
          const { gameRunning, round, choices, ...health } = gameState;
          for (let key in health) {
            if (key === id) setMyHealth(health[key]);
            else {
              setFriendHealth(health[key]);
            }
          }
        };

        socket.on('game-resume', (gameState) => {
          if (!inputFlowRunning) {
            setWinner(null);
            setInputFlowRunning(true);
            loadState(gameState);
            getRoundInput();
          }
        });

        socket.on('game-begin', () => {
          if (!inputFlowRunning) {
            setWinner(null);
            setFriendHealth(100);
            setMyHealth(100);
            setMyChoice(null);
            setFriendChoice(null);
            setInputFlowRunning(true);
            setTimeout(() => {
              getRoundInput();
            }, 4000);
          }
        });

        socket.on('round-outcome', (outcome) => {
          if (!roundProcessing) {
            setRoundProcessing(true);

            const {
              tie,
              winner,
              loser,
              newState,
              gameOver,
              tieWeapon,
              ...roundChoices
            } = outcome;

            setDisplayFriend(true);
            if (tie) {
              playSound(soundFx.tie);
              setFriendChoice(tieWeapon);
            } else {
              const winningWeapon = weaponAudio[outcome[outcome.winner]];
              [winningWeapon, soundFx.fightShort].forEach((s) => playSound(s));
              const { gameRunning, round, choices, ...health } = newState;
              for (let key in health) {
                if (key === id) setMyHealth(health[key]);
                else {
                  setFriendChoice(roundChoices[key]);
                  setFriendHealth(health[key]);
                }
              }
            }

            if (gameOver) {
              setTimeout(() => {
                if (winner === id) {
                  playSound(soundFx.win);
                } else {
                  playSound(soundFx.lose);
                }
                setWinner(winner);

                setTimeout(() => {
                  setInputFlowRunning(false);
                }, 3000);
              }, 4000);
            } else {
              setTimeout(() => {
                setRoundProcessing(false);
                getRoundInput();
              }, 10000);
            }
          }
        });

        function connectToNewUser(userId, stream, userSocketId) {
          const call = myPeer.current.call(userId, stream, {
            metadata: userSocketId,
          });
          if (call) {
            call.on('stream', (userVideoStream) =>
              setFriendStream(userVideoStream)
            );
            call.on('close', () => {
              call.removeAllListeners();
              call.close();
              friendVideoRef.current.close();
              friendVideoRef.current.removeAllListeners();
            });

            friendVideoRef.current = call;
          }
        }
      });
  };

  const playAgain = () => {
    setWinner(null);
    socket.emit('play-again', friendshipId);
  };

  return (
    <div className={classes.friendBattle}>
      <Grid container className={classes.game} direction='column'>
        <Grid item>
          <Grid container alignContent='stretch' direction='row'>
            <Grid item xs={12} sm={12} md={5} lg={5}>
              <Grid
                container
                direction='column'
                className={classes.playerContainer}
              >
                <Grid item className={classes.videoContainer}>
                  {friendStream && friendStream.active ? (
                    <Video stream={friendStream} display={displayFriend} />
                  ) : (
                    <img className={classes.friendVideo} src={loadingblue} />
                  )}

                  <div className={classes.iconLayer}>
                    <img
                      src={weaponImgs[friendChoice || 'blank']}
                      alt='friends choice'
                      className={classes.friendChoiceIcon}
                    />
                  </div>
                  {!displayFriend && (
                    <div className={classes.chooseMessage}>
                      choose your weapon
                    </div>
                  )}
                </Grid>
                <Grid item className={classes.healthbarContainer}>
                  <div
                    className={classes.healthbar}
                    style={{ width: `${friendHealth}%` }}
                  ></div>
                  <div className={classes.playerName}>{friendData.name}</div>
                </Grid>
              </Grid>
            </Grid>
            <Grid
              item
              xs={12}
              md={2}
              sm={6}
              lg={2}
              className={classes.dialogSection}
            >
              <Grid
                container
                direction='column'
                justifycontent='space-between'
                className={classes.dialog}
              >
                <Grid item className={classes.dialogTitle}>
                  <p>FRIEND BATTLE</p>
                </Grid>

                <Grid item className={classes.results}>
                  {winner && (
                    <>
                      <div>
                        winner: {winner === id ? name : friendData.name}
                      </div>
                      <button
                        className={classes.playAgainBtn}
                        onClick={playAgain}
                      >
                        play again
                      </button>
                    </>
                  )}
                </Grid>
                <Grid item className={classes.messenger}>
                  <ul className={classes.messages}>
                    {messages &&
                      messages.map((message, i) => (
                        <li key={i} className={classes.message}>
                          <strong>{message.name}</strong>: {message.content}
                        </li>
                      ))}
                    <div ref={scrollRef} />
                  </ul>

                  <input
                    className={classes.messageInput}
                    onKeyPress={handleKeyDown}
                    onChange={handleChatInput}
                    value={chatInput}
                    type='text'
                    placeholder='message...'
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} sm={6} md={5} lg={5}>
              <Grid
                container
                direction='column'
                className={classes.playerContainer}
              >
                <Grid item className={classes.videoContainer}>
                  <Webcam
                    className={classes.myVideo}
                    ref={myCamRef}
                    onUserMedia={handleUserMedia}
                  />

                  <div className={classes.iconLayer}>
                    <img
                      src={weaponImgs[myChoice || 'blank']}
                      alt='friends choice'
                      className={classes.myChoiceIcon}
                    />
                  </div>

                  <div className={classes.controls}>
                    <button onClick={playStop} className={classes.controlBtn}>
                      {!icons.video ? <Stop /> : <PlayArrow />}
                      <span>{!icons.video ? 'stop' : 'start'}</span>
                    </button>
                    <button className={classes.controlBtn} onClick={toggleMute}>
                      {!icons.audio ? <Mic /> : <MicOff />}
                      <span> {!icons.audio ? 'Mute' : 'Unmute'}</span>
                    </button>
                  </div>
                </Grid>

                <Grid item className={classes.healthbarContainer}>
                  <div
                    className={classes.healthbar}
                    style={{ width: `${myHealth}%` }}
                  ></div>
                  <div className={classes.playerName}>{name}</div>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

const Video = ({ stream, display }) => {
  const classes = useStyles();
  const ref = useRef();
  useEffect(() => {
    if (stream) ref.current.srcObject = stream;
  }, [stream]);
  return (
    <video
      playsInline
      autoPlay
      ref={ref}
      className={classes.friendVideo}
      style={{ opacity: display ? 1 : 0 }}
    />
  );
};

export default FriendBattle;
