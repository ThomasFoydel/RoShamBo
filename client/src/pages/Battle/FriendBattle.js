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

const useStyles = makeStyles((theme) => ({
  playerContainer: {},
  videoContainer: {
    background: 'black',
    position: 'relative',
  },

  friendVideo: {
    display: 'block',
    width: '100%',
    transition: 'all .8s ease',
  },
  myVideo: {
    width: '100%',
    display: 'block',
  },

  healthbarContainer: {
    width: '100%',
    background: '#db3030',
    position: 'relative',
  },
  healthbar: {
    ...theme.healthbar,

    [theme.breakpoints.down('sm')]: {
      height: '3rem',
    },
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
  },
  controls: {
    position: 'absolute',
    right: 0,
    bottom: 0,
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
}));

const FriendBattle = ({ props: { socketRef, match } }) => {
  const [appState] = useContext(CTX);
  const [display, setDisplayFriend] = useState(true);
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
  const [peerStream, setPeerStream] = useState({});

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
      const videoWidth = myCamRef.current.video.videoWidth;
      const videoHeight = myCamRef.current.video.videoHeight;
      myCamRef.current.video.width = videoWidth;
      myCamRef.current.video.height = videoHeight;

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
            setInputFlowRunning(true);
            getRoundInput();
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
              ...roundChoices
            } = outcome;

            setDisplayFriend(true);
            if (tie) {
              setFriendChoice(myChoice);
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
    <div className={classes.connect}>
      <div className={classes.videochat}>
        <Grid container direction='column'>
          <Grid item>
            <Grid
              container
              alignItems='stretch'
              direction='row'
              className={classes.friendCamContainer}
            >
              <Grid item xs={12} sm={12} md={5} lg={5}>
                <Grid
                  container
                  direction='column'
                  alignItems='center'
                  className={classes.playerContainer}
                >
                  <Grid item className={classes.videoContainer}>
                    {peerStream && peerStream.active && (
                      <Video stream={peerStream} display={display} />
                    )}
                  </Grid>
                  <Grid item className={classes.healthbarContainer}>
                    <div
                      className={classes.healthbar}
                      style={{ width: `${friendHealth}%` }}
                    ></div>
                    <div className={classes.playerName}>cedric</div>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={2} sm={6} lg={2}>
                <div className={classes.dialog}>
                  <h3 className={classes.dialogTitle}>FRIEND BATTLE</h3>
                  {winner && (
                    <>
                      <div>winner: {winner}</div>
                      <button onClick={playAgain}>play again</button>
                    </>
                  )}
                  <div className={classes.chatSection}>
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
                </div>
              </Grid>

              <Grid item item item xs={12} sm={6} md={5} lg={5}>
                <Grid
                  container
                  direction='column'
                  alignItems='center'
                  className={classes.playerContainer}
                >
                  <Grid item className={classes.videoContainer}>
                    <Webcam
                      className={classes.myVideo}
                      ref={myCamRef}
                      onUserMedia={handleUserMedia}
                    />
                    <div className={classes.controls}>
                      <div className={classes.controlsBlock}>
                        <button
                          onClick={playStop}
                          className={classes.controlBtn}
                        >
                          {!icons.video ? <Stop /> : <PlayArrow />}
                          <span>{!icons.video ? 'stop' : 'start'}</span>
                        </button>
                        <button
                          className={classes.controlBtn}
                          onClick={muteUnmute}
                        >
                          {!icons.audio ? <Mic /> : <MicOff />}
                          <span> {!icons.audio ? 'Mute' : 'Unmute'}</span>
                        </button>
                      </div>
                    </div>
                  </Grid>

                  <Grid item className={classes.healthbarContainer}>
                    <div
                      className={classes.healthbar}
                      style={{ width: `${myHealth}%` }}
                    ></div>
                    <div className={classes.playerName}>cedric</div>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

const Video = ({ stream, display }) => {
  const classes = useStyles();
  const ref = useRef();
  useEffect(() => {
    ref.current.srcObject = stream;
  }, []);
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
