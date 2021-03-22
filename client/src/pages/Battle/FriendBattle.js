import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import Peer from 'peerjs';
import { CTX } from 'context/Store';
import { makeStyles } from '@material-ui/core';
import Webcam from 'react-webcam';
import { Stop, PlayArrow, Mic, MicOff } from '@material-ui/icons';
const useStyles = makeStyles(() => ({}));

const FriendBattle = ({ props: { socketRef, match } }) => {
  const [appState] = useContext(CTX);
  const classes = useStyles();
  const socket = socketRef.current;
  let {
    user: { name },
    auth: { token },
  } = appState;
  const { friendshipId } = match.params;
  const [myVideoStream, setMyVideoStream] = useState(null);
  const peerRef = useRef();

  const [videoStream, setVideoStream] = useState({});

  const [icons, setIcons] = useState({ video: false, audio: false });
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);

  const webcamRef = useRef();
  const scrollRef = useRef();

  const myPeer = useRef();

  useEffect(() => {
    return async () => {
      if (socket) socket.emit('disconnect-room', socket.id);
      if (myPeer.current) myPeer.current.destroy();
    };
  }, [token]);
  useEffect(() => {
    return () =>
      myVideoStream &&
      myVideoStream.getTracks().forEach((track) => track.stop());
  }, [myVideoStream]);

  const playStop = () => {
    if (myVideoStream) {
      let enabled = myVideoStream.getVideoTracks()[0].enabled;
      setIcons({ ...icons, video: !icons.video });
      if (enabled) myVideoStream.getVideoTracks()[0].enabled = false;
      else myVideoStream.getVideoTracks()[0].enabled = true;
    }
  };

  const muteUnmute = () => {
    if (myVideoStream) {
      if (myVideoStream.getAudioTracks().length === 0) return;
      const enabled = myVideoStream.getAudioTracks()[0].enabled;
      setIcons({ ...icons, audio: !icons.audio });
      if (enabled) myVideoStream.getAudioTracks()[0].enabled = false;
      else myVideoStream.getAudioTracks()[0].enabled = true;
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

        setMyVideoStream(stream);

        myPeer.current.on('call', function (call) {
          call.answer(stream, { metadata: socket.id });
          call.on('stream', function (callStream) {
            setVideoStream(callStream);
          });
        });

        socket.on('user-connected', ({ userId, mySocketId }) => {
          if (userId) connectToNewUser(userId, stream, mySocketId);
        });

        socket.on('create-message', (message) => {
          setMessages((messages) => [...messages, message]);
        });

        socket.on('user-disconnected', () => {
          if (peerRef.current) peerRef.current.close();
          peerRef.current = null;
          setVideoStream(null);
        });

        function connectToNewUser(userId, stream, userSocketId) {
          const call = myPeer.current.call(userId, stream, {
            metadata: userSocketId,
          });
          if (call) {
            call.on('stream', (userVideoStream) =>
              setVideoStream(userVideoStream)
            );
            call.on('close', (e) => {
              call.removeAllListeners();
              call.close();
              peerRef.current.close();
              peerRef.current.removeAllListeners();
            });

            peerRef.current = call;
          }
        }
      });
  };

  return (
    <div className={classes.connect}>
      <div className={classes.videochat}>
        <Webcam ref={webcamRef} onUserMedia={handleUserMedia} />

        {videoStream && videoStream.active && <Video stream={videoStream} />}

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

const Video = ({ stream }) => {
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
      style={{ width: '20rem', height: '20rem' }}
    />
  );
};

export default FriendBattle;
