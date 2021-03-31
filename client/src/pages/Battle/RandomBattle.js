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

const useStyles = makeStyles((theme) => ({}));

const RandomBattle = ({ props: { socketRef } }) => {
  const socket = socketRef.current;
  const [appState, updateState] = useContext(CTX);
  const {
    auth: { token },
    user: { id },
  } = appState;
  const myCamRef = useRef();
  const myStreamRef = useRef();
  const myPeer = useRef();
  const randoVideoRef = useRef();
  const [userMediaLoaded, setUserMediaLoaded] = useState(false);
  const [handPoseNet, setHandPoseNet] = useState(null);
  const classes = useStyles();
  const [roomId, setRoomId] = useState(null);
  const [randoInfo, setRandoInfo] = useState({ name: '', userId: null });
  const [randoStream, setRandoStream] = useState(null);
  const [displayRando, setDisplayRando] = useState(true);
  const [count, setCount] = useState(null);

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
    setCount(20);
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
      if (!myChoice) return setCount(20);
      socket.emit('randombattle-userchoice', {
        roomId: roomId,
        userId: id,
        userChoice: myChoice,
      });
      setCount(null);
    }
  }, [count]);

  useEffect(() => {
    return () => {
      socket.off('randombattle-userconnect');
      socket.off('randombattle-opponentinfo');
      socket.off('randombattle-gamebegin');
      socket.off('rando-left-the-building');
      socket.off('randombattle-roundoutcome');
      socket.emit('leave-randomroom', roomId);
    };
  }, []);

  const handleUserMedia = (stream) => {
    myStreamRef.current = stream;
    async function loadHandPose() {
      const net = await handpose.load();
      setHandPoseNet(net);
    }
    loadHandPose().then(() => {
      socket.on('randombattle-userconnect', ({ roomId, rando }) => {
        const { userId, peerId, name } = rando;
        setRoomId(roomId);
        setRandoInfo({ name, userId });
        // peer call
        connectToNewUser(peerId, stream, roomId);
      });

      socket.on('randombattle-opponentinfo', ({ rando, roomId }) => {
        const { userId, name } = rando;
        setRandoInfo({ name, userId });
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
          }, 4000);
        }
      });

      socket.on('randombattle-roundoutcome', (roundOutcome) => {
        console.log('roundOutcome: ', roundOutcome);
      });

      socket.on('rando-left-the-building', () => {
        if (randoVideoRef.current) randoVideoRef.current.close();
        randoVideoRef.current = null;
        setRandoStream(null);
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
  return (
    <div>
      {userMediaLoaded && <button onClick={handleReady}>I'm ready</button>}
      <Webcam
        className={classes.myVideo}
        ref={myCamRef}
        onUserMedia={handleUserMedia}
      />
      <h2>name: {randoInfo.name}</h2>
      {randoStream && randoStream.active ? (
        <Video stream={randoStream} display={displayRando} />
      ) : (
        <h2>no peer</h2>
      )}
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

export default RandomBattle;
