import React, { useState, useEffect, useContext } from 'react';
import {
  makeStyles,
  Avatar,
  Typography,
  Input,
  Button,
} from '@material-ui/core';
import { CTX } from 'context/Store';
import axios from 'axios';
const useStyles = makeStyles((theme) => ({
  messages: {
    background: '#555',
    color: 'white',
    padding: '12rem',
  },
  input: {
    color: 'white',
  },
  sendBtn: {
    color: 'white',
    background: theme.palette.primary.main,
    '&:hover': {
      background: theme.palette.primary.dark,
    },
  },
}));
const Messages = ({ props: { socketRef } }) => {
  const socket = socketRef.current;
  const [friends, setFriends] = useState([]);
  const [appState] = useContext(CTX);
  const [currentThread, setCurrentThread] = useState(null);
  const classes = useStyles();
  const { token } = appState.auth;

  useEffect(() => {
    axios
      .get('/api/user/friendlist', { headers: { 'x-auth-token': token } })
      .then(({ data }) => {
        setFriends(data);
      })
      .catch((err) => console.log(err));
  }, [token]);

  const handleSelectFriend = (id) => {
    setCurrentThread(id);
  };
  return (
    <div className={classes.messages}>
      <div className={classes.threadList}></div>
      {friends.map((friend) => (
        <Friend
          key={friend}
          props={{ friend, className: classes.friend, handleSelectFriend }}
        />
      ))}
      <MessageBox props={{ currentThread, token, socket }} />
    </div>
  );
};

const Friend = ({ props: { friend, className, handleSelectFriend } }) => {
  return (
    <div className={className} onClick={() => handleSelectFriend(friend._id)}>
      <Avatar src={`/api/image/${friend.profilePic}`}>
        {!friend.profilePic && friend.name && friend.name[0].toUpperCase()}
      </Avatar>
      <Typography> {friend.name}</Typography>
    </div>
  );
};

const MessageBox = ({ props: { currentThread, token, socket } }) => {
  const [thread, setThread] = useState([]);
  const handleNewMessage = (message) => {
    if (
      message.sender === currentThread ||
      message.receiver === currentThread
    ) {
      setThread((t) => [...t, message]);
    }
  };
  useEffect(() => {
    if (socket) socket.off('chat-message');
    socket.on('chat-message', (message) => {
      handleNewMessage(message);
    });
    return () => {
      if (socket) socket.off('chat-message');
    };
  }, [currentThread]);
  useEffect(() => {
    let subscribed = true;
    if (currentThread) {
      axios
        .get(`/api/message/thread/${currentThread}`, {
          headers: { 'x-auth-token': token },
        })
        .then(({ data }) => {
          if (data) {
            setThread(data);
          }
        })
        .catch((err) => console.log(err));
    }
    return () => (subscribed = false);
  }, [currentThread]);
  return (
    <div>
      {thread.map((message) => (
        <Message key={message._id} props={{ message }} />
      ))}
      <ChatBox props={{ token, currentThread }} />
    </div>
  );
};

const Message = ({ props: { message } }) => {
  return (
    <div>
      <h2>message: {message.content}</h2>
    </div>
  );
};

const ChatBox = ({ props: { token, currentThread } }) => {
  const classes = useStyles();
  const [inputValue, setInputValue] = useState('');
  const sendMessage = () => {
    axios
      .post(
        '/api/message/new',
        { receiver: currentThread, content: inputValue },
        {
          headers: { 'x-auth-token': token },
        }
      )
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  };
  const handleChange = ({ target: { value } }) => setInputValue(value);
  const handleKeyDown = ({ charCode }) => {
    if (charCode === 13) {
      handleChange();
    }
  };
  return (
    <div>
      <Input
        className={classes.input}
        value={inputValue}
        onKeyPress={handleKeyDown}
        onChange={handleChange}
      />
      <Button className={classes.sendBtn} onClick={sendMessage}>
        send
      </Button>
    </div>
  );
};
export default Messages;
