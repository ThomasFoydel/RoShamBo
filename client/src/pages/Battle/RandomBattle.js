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

  function connectToNewUser(peerId, stream) {
    const call = myPeer.current.call(peerId, stream);
    if (call) {
      call.on('stream', (userVideoStream) => setRandoStream(userVideoStream));
      call.on('close', () => {
        call.removeAllListeners();
        call.close();
        randoVideoRef.current.close();
        randoVideoRef.current.removeAllListeners();
      });

      randoVideoRef.current = call;
    }
  }

  useEffect(() => {
    return () => {
      socket.off('randombattle-userconnect');
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
        connectToNewUser(peerId, stream);
      });

      socket.on('randombattle-opponentinfo', ({ rando }) => {
        const { userId, name } = rando;
        setRandoInfo({ name, userId });
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
