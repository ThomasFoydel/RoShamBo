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
  },
  window: {
    background: 'rgba(255,255,255,0.2)',
    height: '11rem',
    overflow: 'scroll',
  },
  messages: {},
  message: {
    background: 'rgba(0,0,0,0.3)',
    padding: '.1rem',
    margin: '.1rem',
  },
  dialog: {
    minWidth: '4rem',
    minHeight: '4rem',
    background: 'purple',
    color: 'white',
    fontFamily: 'OpenDyslexic',
    textAlign: 'center',
    fontSize: '1rem',
  },
  chooseMessage: {
    color: 'white',
    position: 'absolute',
    fontSize: '2.5rem',
    textAlign: 'center',
    fontFamily: 'OpenDyslexic',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  messageInput: {
    padding: '.5rem .2rem',
    fontFamily: 'OpenDyslexic',
  },
  friendBattle: {
    background: 'black',
    paddingBottom: '20rem',
  },
  game: {
    padding: '2rem',
    [theme.breakpoints.down('sm')]: {
      padding: 0,
    },
  },
}));

const FriendBattle = ({ props: { socketRef, match } }) => {
  const [appState] = useContext(CTX);
  const [displayFriend, setDisplayFriend] = useState(true);
  const classes = useStyles();
  const socket = socketRef.current;
  let {
    user: { name, id },
    auth: { token },
  } = appState;
  const { friendshipId } = match.params;
  const myCamRef = useRef();
  const [myStream, setMyStream] = useState(null);
  const peerVideoRef = useRef();
  const [peerStream, setPeerStream] = useState(null);
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
      if (!myChoice) return setCount(40);
      socket.emit('user-choice', {
        roomId: friendshipId,
        userId: id,
        userChoice: myChoice,
      });
      setCount(null);
    }
  }, [count]);

  const getRoundInput = () => {
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
      myStream && myStream.getTracks().forEach((track) => track.stop());
  }, [myStream]);

  const playStop = () => {
    if (myStream) {
      let enabled = myStream.getVideoTracks()[0].enabled;
      setIcons({ ...icons, video: !icons.video });
      if (enabled) myStream.getVideoTracks()[0].enabled = false;
      else myStream.getVideoTracks()[0].enabled = true;
    }
  };

  const muteUnmute = () => {
    if (myStream) {
      if (myStream.getAudioTracks().length === 0) return;
      const enabled = myStream.getAudioTracks()[0].enabled;
      setIcons({ ...icons, audio: !icons.audio });
      if (enabled) myStream.getAudioTracks()[0].enabled = false;
      else myStream.getAudioTracks()[0].enabled = true;
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

        setMyStream(stream);

        myPeer.current.on('call', function (call) {
          call.answer(stream, { metadata: socket.id });
          call.on('stream', function (callStream) {
            setPeerStream(callStream);
          });
        });

        socket.on('user-connected', ({ userId, mySocketId }) => {
          if (userId) connectToNewUser(userId, stream, mySocketId);
        });

        socket.on('friendbattle-message', (message) => {
          setMessages((messages) => [...messages, message]);
        });

        socket.on('user-disconnected', () => {
          if (peerVideoRef.current) peerVideoRef.current.close();
          peerVideoRef.current = null;
          setPeerStream(null);
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
            getRoundInput();
          }
        });

        socket.on('round-outcome', (outcome) => {
          console.log('outcome: ', outcome);
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
              setFriendChoice(tieWeapon);
            } else {
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
              setInputFlowRunning(false);
              setWinner(winner);
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
              setPeerStream(userVideoStream)
            );
            call.on('close', (e) => {
              call.removeAllListeners();
              call.close();
              peerVideoRef.current.close();
              peerVideoRef.current.removeAllListeners();
            });

            peerVideoRef.current = call;
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
                  {peerStream && peerStream.active ? (
                    <Video stream={peerStream} display={displayFriend} />
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
            <Grid item xs={12} md={2} sm={6} lg={2} className={classes.dialog}>
              <div>
                <h3 className={classes.dialogTitle}>FRIEND BATTLE</h3>
                {winner && (
                  <>
                    <div>winner: {winner}</div>
                    <button onClick={playAgain}>play again</button>
                  </>
                )}

                <div className={classes.messenger}>
                  <div className={classes.window}>
                    <ul className={classes.messages}>
                      {messages.map((message, i) => (
                        <li key={i} className={classes.message}>
                          <strong>{message.name}</strong>: {message.content}
                        </li>
                      ))}
                      <div ref={scrollRef} />
                    </ul>
                  </div>

                  <input
                    className={classes.messageInput}
                    onKeyPress={handleKeyDown}
                    onChange={handleChatInput}
                    value={chatInput}
                    type='text'
                    placeholder='message...'
                  />
                </div>
              </div>
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
                    <button className={classes.controlBtn} onClick={muteUnmute}>
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
