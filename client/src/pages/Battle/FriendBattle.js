import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import Peer from 'peerjs';
import * as handpose from '@tensorflow-models/handpose';
import * as tf from '@tensorflow/tfjs'; // eslint-disable-line
import * as fp from 'fingerpose';
import gestures from './gestures';
import Webcam from 'react-webcam';
import { makeStyles } from '@material-ui/core';
import { Stop, PlayArrow, Mic, MicOff } from '@material-ui/icons';
import { CTX } from 'context/Store';
const useStyles = makeStyles(() => ({}));

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

  const [icons, setIcons] = useState({ video: false, audio: false });
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [count, setCount] = useState(null);
  const [userChoice, setUserChoice] = useState(null);
  const scrollRef = useRef();
  const myPeer = useRef();
  const [handPoseNet, setHandPoseNet] = useState(null);

  useEffect(() => {
    async function loadHandPose() {
      const net = await handpose.load();
      setHandPoseNet(net);
      //   detect(net);
    }
    loadHandPose();
  }, []);

  //   const detectHand = () => {
  //           const video = myCamRef.current.video;
  //           const videoWidth = myCamRef.current.video.videoWidth;
  //           const videoHeight = myCamRef.current.video.videoHeight;
  //           myCamRef.current.video.width = videoWidth;
  //           myCamRef.current.video.height = videoHeight;
  //             const hand = await net.estimateHands(video);
  //   }

  const detect = async (net) => {
    // console.log('detect!');
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
        const userChoice = await detect(handPoseNet);
        if (userChoice) console.log(userChoice);
        if (userChoice) setUserChoice(userChoice);
      };
      getHandPose();

      setTimeout(() => {
        setCount((c) => c - 1);
      }, 1000);
    } else {
      if (!userChoice) return setCount(40);
      socket.emit('user-choice', {
        roomId: friendshipId,
        userId: id,
        userChoice,
      });
      setCount(null);
    }
  }, [count]);

  const getRoundInput = () => {
    setDisplayFriend(false);
    setCount(5);
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
    socket.emit('message', { content: chatInput, name });
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
    axios
      .get(`/api/battle/connect/${friendshipId}`, {
        headers: { 'x-auth-token': token },
      })
      .then(async ({ data }) => {
        myPeer.current = new Peer();
        myPeer.current.on('open', (id) => {
          socket.emit('join-room', {
            peerId: id,
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

        socket.on('create-message', (message) => {
          setMessages((messages) => [...messages, message]);
        });

        socket.on('user-disconnected', () => {
          if (peerVideoRef.current) peerVideoRef.current.close();
          peerVideoRef.current = null;
          setPeerStream(null);
        });

        socket.on('game-begin', () => {
          getRoundInput();
          console.log('game begin!');
        });

        socket.on('round-outcome', (outcome) => {
          console.log('round outcome: ', outcome);
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

  return (
    <div className={classes.connect}>
      <div className={classes.videochat}>
        <Webcam ref={myCamRef} onUserMedia={handleUserMedia} />

        {peerStream && peerStream.active && (
          <Video stream={peerStream} display={display} />
        )}
        <div>{userChoice}</div>

        <div className={classes.controls}>
          <div className={classes.controlsBlock}>
            <button onClick={playStop} className={classes.controlBtn}>
              {!icons.video ? <Stop /> : <PlayArrow />}
              <span>{!icons.video ? 'stop' : 'start'}</span>
            </button>
            <button className={classes.controlBtn} onClick={muteUnmute}>
              {!icons.audio ? <Mic /> : <MicOff />}
              <span> {!icons.audio ? 'Mute' : 'Unmute'}</span>
            </button>
          </div>
        </div>
      </div>
      <div className={classes.messenger}>
        <div className={classes.window}>
          <ul className={classes.messages}>
            {messages.map((message, i) => (
              <li key={i}>
                <strong>{message.name}</strong>: {message.content}
              </li>
            ))}
            <div ref={scrollRef} />
          </ul>
        </div>
        <div className={classes.messageContainer}>
          <input
            onKeyPress={handleKeyDown}
            onChange={handleChatInput}
            value={chatInput}
            type='text'
            placeholder='message...'
          />
        </div>
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
      className={classes.peerVideo}
      style={{
        width: '20rem',
        height: '20rem',
        display: display ? 'inherit' : 'none',
      }}
    />
  );
};

export default FriendBattle;
