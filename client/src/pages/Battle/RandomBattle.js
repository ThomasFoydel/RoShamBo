import React, { useState, useEffect, useRef, useContext } from 'react';
import * as tf from '@tensorflow/tfjs'; // eslint-disable-line
import Peer from 'peerjs';
import * as handpose from '@tensorflow-models/handpose';
import * as fp from 'fingerpose';
import gestures from './gestures';
import Webcam from 'react-webcam';
import { Grid } from '@mui/material';
import { Stop, PlayArrow, Mic, MicOff } from '@mui/icons-material'
import { CTX } from 'context/Store';
import weaponImgs from 'imgs/weapons';
import loadingblue from 'imgs/loadingblue.gif';

import weaponAudio from 'audio/weapons';
import soundFx from 'audio/fx';
import axios from 'axios';
import useClasses from 'customHooks/useClasses';

const playSound = (s) => {
  s.currentTime = 0;
  s.play();
};

const styles = (theme) => ({
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
  randoVideo: {
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
    transition: 'all 0.3s ease',
  },
  randoChoiceIcon: {
    width: '70%',
    minHeight: '0%',
    minWidth: '70%',
    opacity: '0.6',
  },
  myChoiceIcon: {
    width: '70%',
    transform: 'scaleX(-1)',
    minHeight: '0%',
    opacity: '0.6',
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
    overflowY: 'auto',
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
  randomBattle: {
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
  readyBtn: {
    maxWidth: '100%',
    padding: '.1rem .2rem',
    fontFamily: 'OpenDyslexic',
    cursor: 'pointer',
  },
});

const RandomBattle = ({ props: { socketRef } }) => {
  const socket = socketRef.current;
  const [appState] = useContext(CTX);
  const {
    auth: { token },
    user: { id, name },
  } = appState;
  const myCamRef = useRef();
  const myStreamRef = useRef();
  const myPeer = useRef();
  const randoVideoRef = useRef();
  const [userMediaLoaded, setUserMediaLoaded] = useState(false);
  const [handPoseNet, setHandPoseNet] = useState(null);
  const classes = useClasses(styles);
  const [roomId, setRoomId] = useState(null);
  const [randoStream, setRandoStream] = useState(null);
  const [randoData, setRandoData] = useState({ name: '', userId: null });
  const [displayRando, setDisplayRando] = useState(true);
  const [count, setCount] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [icons, setIcons] = useState({ video: false, audio: false });
  const scrollRef = useRef();
  const [inPool, setInPool] = useState(false);
  const [roundProcessing, setRoundProcessing] = useState(false);
  const [friendshipExists, setFriendshipExists] = useState(true);

  const [myHealth, setMyHealth] = useState(100);
  const [randoHealth, setRandoHealth] = useState(100);
  const [myChoice, setMyChoice] = useState(null);
  const [randoChoice, setRandoChoice] = useState(null);
  const [inputFlowRunning, setInputFlowRunning] = useState(false);
  const [winner, setWinner] = useState(null);

  function connectToNewUser(peerId, stream, roomId) {
    const call = myPeer.current.call(peerId, stream);
    let streamcount = 0;
    if (call) {
      call.on('stream', (userVideoStream) => {
        streamcount += 1;
        if (streamcount > 1) return;
        setRandoStream(userVideoStream);
        socket.emit('randombattle-connectioncomplete', { roomId, userId: id });
      });
      call.on('close', () => {
        call.removeAllListeners();
        call.close();
        randoVideoRef.current.close();
        randoVideoRef.current.removeAllListeners();
      });

      randoVideoRef.current = call;
    }
  }

  const getRoundInput = () => {
    setRandoChoice(null);
    setDisplayRando(false);
    setCount(10);
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
      }, 500);
    } else {
      if (!myChoice) return setCount(10);
      setTimeout(() => {
        socket.emit('randombattle-userchoice', {
          roomId: roomId,
          userId: id,
          userChoice: myChoice,
        });
        setCount(null);
      }, 500);
    }
  }, [count]);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.off('randombattle-pooljoined');
        socket.off('randombattle-userconnect');
        socket.off('randombattle-opponentinfo');
        socket.off('randombattle-gamebegin');
        socket.off('rando-left-the-building');
        socket.off('randombattle-roundoutcome');
        socket.off('randombattle-message');
        socket.emit('leave-randomroom', roomId);
      }
    };
  }, []);

  const handleUserMedia = (stream) => {
    myStreamRef.current = stream;
    async function loadHandPose() {
      const net = await handpose.load();
      setHandPoseNet(net);
    }
    loadHandPose().then(() => {
      socket.on('randombattle-pooljoined', () => setInPool(true));
      socket.on('randombattle-userconnect', ({ roomId, rando }) => {
        const { userId, peerId, name } = rando;
        setRoomId(roomId);
        setRandoData({ name, userId });
        connectToNewUser(peerId, stream, roomId);
      });

      socket.on('randombattle-opponentinfo', ({ rando, roomId }) => {
        const { userId, name } = rando;
        setRandoData({ name, userId });
        setRoomId(roomId);
      });

      socket.on('randombattle-gamebegin', () => {
        if (!inputFlowRunning) {
          setWinner(null);
          setRandoHealth(100);
          setMyHealth(100);
          setMyChoice(null);
          setRandoChoice(null);
          setInputFlowRunning(true);
          setTimeout(() => {
            getRoundInput();
          }, 8000);
        }
      });

      socket.on('randombattle-roundoutcome', (outcome) => {
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

          setDisplayRando(true);
          if (tie) {
            playSound(soundFx.tie);
            setRandoChoice(tieWeapon);
          } else {
            const winningWeapon = weaponAudio[outcome[outcome.winner]];
            [winningWeapon, soundFx.fightShort].forEach((s) => playSound(s));
            const { gameRunning, round, choices, ...health } = newState;
            for (let key in health) {
              if (key === id) setMyHealth(health[key]);
              else {
                setRandoChoice(roundChoices[key]);
                setRandoHealth(health[key]);
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
            }, 5000);
          } else {
            setTimeout(() => {
              setRoundProcessing(false);
              getRoundInput();
            }, 5000);
          }
        }
      });

      socket.on('randombattle-message', (message) =>
        setMessages((messages) => [...messages, message])
      );

      socket.on('rando-left-the-building', () => {
        handleBackToPool();
      });

      setUserMediaLoaded(true);
    });
  };

  const handleReady = () => {
    myPeer.current = new Peer();
    myPeer.current.on('open', (peerId) => {
      socket.emit('join-random-pool', {
        peerId: peerId,
        socketId: socket.id,
        token: token,
      });
    });
    myPeer.current.on('call', function (call) {
      call.answer(myStreamRef.current, { metadata: socket.id });
      call.on('stream', function (callStream) {
        setRandoStream(callStream);
      });
    });
  };

  const detect = async (net) => {
    if (
      typeof myCamRef.current !== 'undefined' &&
      myCamRef.current !== null &&
      myCamRef.current.video.readyState === 4
    ) {
      const video = myCamRef.current.video;
      if (!net) return;
      const hand = await net.estimateHands(video);
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
  const playStop = () => {
    if (myStreamRef.current) {
      let enabled = myStreamRef.current.getVideoTracks()[0].enabled;
      setIcons({ ...icons, video: !icons.video });
      if (enabled) myStreamRef.current.getVideoTracks()[0].enabled = false;
      else myStreamRef.current.getVideoTracks()[0].enabled = true;
    }
  };
  const handleSubmit = () => {
    if (!chatInput) return;
    socket.emit('randombattle-message', {
      content: chatInput,
      name,
      roomId,
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

  const toggleMute = () => {
    if (myStreamRef.current) {
      if (myStreamRef.current.getAudioTracks().length === 0) return;
      const enabled = myStreamRef.current.getAudioTracks()[0].enabled;
      setIcons({ ...icons, audio: !icons.audio });
      if (enabled) myStreamRef.current.getAudioTracks()[0].enabled = false;
      else myStreamRef.current.getAudioTracks()[0].enabled = true;
    }
  };
  const playAgain = () => {
    setWinner(null);
    socket.emit('randombattle-playagain', roomId);
  };

  useEffect(() => {
    randoData.userId &&
      axios
        .get(`/api/user/profile/${randoData.userId}`, {
          headers: { 'x-auth-token': token },
        })
        .then(({ data: { friendshipExists } }) => {
          setFriendshipExists(friendshipExists);
        });
  }, [randoData]);

  const handleAddFriend = () => {
    randoData.userId &&
      axios
        .post(
          '/api/user/friendrequest',
          { id: randoData.userId },
          { headers: { 'x-auth-token': token } }
        )
        .then(() => setFriendshipExists(true));
  };

  const handleBackToPool = () => {
    if (randoVideoRef.current) {
      randoVideoRef.current.close();
      randoVideoRef.current.removeAllListeners();
    }
    setWinner(null);
    myPeer.current.destroy();
    socket.emit('leave-randomroom', roomId);
    setRandoStream(null);
    randoVideoRef.current = null;
    setRoomId(null);
    setRandoData({ name: '', userId: null });
    setDisplayRando(true);
    setCount(null);
    setChatInput('');
    setMessages([]);
    setRoundProcessing(false);
    setFriendshipExists(true);
    setMyHealth(100);
    setRandoHealth(100);
    setMyChoice(null);
    setRandoChoice(null);
    setInputFlowRunning(false);
    handleReady();
  };
  return (
    <div className={classes.randomBattle}>
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
                  {randoStream && randoStream.active ? (
                    <Video stream={randoStream} display={displayRando} />
                  ) : (
                    <img
                      className={classes.randoVideo}
                      src={loadingblue}
                      alt='random user webcam'
                    />
                  )}

                  <div
                    className={classes.iconLayer}
                    style={{
                      background: randoChoice
                        ? 'rgba(255,255,255,0.125)'
                        : 'rgba(255,255,255,0)',
                    }}
                  >
                    <img
                      src={weaponImgs[randoChoice || 'blank']}
                      alt={`rando choice: ${randoChoice}`}
                      className={classes.randoChoiceIcon}
                    />
                  </div>
                  {!displayRando && (
                    <div className={classes.chooseMessage}>
                      choose your weapon
                    </div>
                  )}
                </Grid>
                <Grid item className={classes.healthbarContainer}>
                  <div
                    className={classes.healthbar}
                    style={{ width: `${randoHealth}%` }}
                  ></div>
                  <div className={classes.playerName}>{randoData.name}</div>
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
                  <p>RANDOM BATTLE</p>
                </Grid>

                <Grid item>
                  {userMediaLoaded && !inPool && (
                    <button className={classes.readyBtn} onClick={handleReady}>
                      I'm ready
                    </button>
                  )}
                </Grid>

                <Grid item className={classes.results}>
                  {winner && (
                    <>
                      <div>winner: {winner === id ? name : randoData.name}</div>
                      <button
                        className={classes.playAgainBtn}
                        onClick={playAgain}
                      >
                        play again
                      </button>
                      {!friendshipExists && (
                        <button onClick={handleAddFriend}>add friend</button>
                      )}
                      <button onClick={handleBackToPool}>
                        next random user
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

                  {randoStream && roomId && (
                    <input
                      className={classes.messageInput}
                      onKeyPress={handleKeyDown}
                      onChange={handleChatInput}
                      value={chatInput}
                      type='text'
                      placeholder='message...'
                    />
                  )}
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
                  <div
                    className={classes.iconLayer}
                    style={{
                      background: myChoice
                        ? 'rgba(255,255,255,0.125)'
                        : 'rgba(255,255,255,0)',
                    }}
                  >
                    <img
                      src={weaponImgs[myChoice || 'blank']}
                      alt='randos choice'
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
  const classes = useClasses(styles);
  const ref = useRef();
  useEffect(() => {
    if (stream) ref.current.srcObject = stream;
  }, [stream]);
  return (
    <video
      playsInline
      autoPlay
      ref={ref}
      className={classes.randoVideo}
      style={{ opacity: display ? 1 : 0 }}
    />
  );
};

export default RandomBattle;
