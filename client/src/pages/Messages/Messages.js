import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Avatar,
  Typography,
  Input,
  Button,
  Grid,
} from '@mui/material';
import { CTX } from 'context/Store';
import axios from 'axios';
import useClasses from 'customHooks/useClasses';

const styles = (theme) => ({
  messages: {
    ...theme.centerHorizontal,
    marginTop: '5em',
    background: 'linear-gradient(#ccc,#ddd)',
    color: 'white',
    padding: '.5em',
    width: '90%',
    maxWidth: '50em',
    borderRadius: '4px',
  },
  friendList: {
    maxHeight: '60vh',
    overflow: 'auto',
  },
  friend: {
    background: '#111',
    padding: '.3em',
    borderRadius: '4px',
    '&:hover': {
      cursor: 'pointer',
    },
  },
  thread: {
    maxHeight: '60vh',
    overflow: 'auto',
    padding: '16px',
  },
  friendProfilePic: {
    background: theme.palette.primary.dark,
    marginRight: '.5em',
  },
  friendName: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  messageContent: {
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '12px',
    padding: '1em',
  },
  senderName: {
    textAlign: 'center',
  },
  message: {
    background: '#111',
    borderRadius: '18px 18px 18px 2px',
    margin: '.5em 0',
    padding: '.5em',
  },
  mine: {
    background: theme.palette.primary.dark,
    borderRadius: '18px 18px 2px 18px',
  },
  authorSection: {
    padding: '.25em .75em',
  },
  mineAuthorSection: {
    justifyContent: 'flex-end',
  },
  senderProfilePic: {
    marginRight: '.5em',
    background: theme.palette.primary.light,
  },
  chatbox: { padding: '.5em' },
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
});

const Messages = ({ props: { socketRef } }) => {
  const socket = socketRef.current;
  const [appState, updateState] = useContext(CTX);
  const classes = useClasses(styles);
  const { token } = appState.auth;
  const userId = appState.user.id;
  const friends = appState.user.friends;
  const currentThread = appState.currentThread;

  const handleSelectFriend = (id) => {
    updateState({
      type: 'CURRENT_THREAD',
      payload: id === appState.currentThread ? null : id,
    });
  };

  return (
    <Grid
      container
      justify='space-around'
      spacing={2}
      wrap='nowrap'
      className={classes.messages}
    >
      <Grid item className={classes.friendList} xs={4}>
        {friends.map((friend) => (
          <Friend
            key={friend._id}
            props={{ friend, className: classes.friend, handleSelectFriend }}
          />
        ))}
      </Grid>
      <Grid item xs={8}>
        <MessageBox props={{ currentThread, token, socket, userId }} />
        {currentThread && <ChatBox props={{ token, currentThread }} />}
      </Grid>
    </Grid>
  );
};

const Friend = ({ props: { friend, handleSelectFriend } }) => {
  const classes = useClasses(styles);
  return (
    <Grid
      container
      className={classes.friend}
      wrap='nowrap'
      alignItems='center'
      onClick={() => handleSelectFriend(friend._id)}
    >
      <Avatar
        className={classes.friendProfilePic}
        src={`/api/image/${friend.profilePic}`}
      >
        {!friend.profilePic && friend.name && friend.name[0].toUpperCase()}
      </Avatar>
      <Typography className={classes.friendName}>{friend.name}</Typography>
    </Grid>
  );
};

const MessageBox = ({ props: { currentThread, token, socket, userId } }) => {
  const [thread, setThread] = useState([]);
  const classes = useClasses(styles);
  const scrollRef = useRef();

  const handleNewMessage = (message) => {
    if (
      message.sender._id === currentThread ||
      message.receiver === currentThread
    ) {
      setThread((t) => [...t, message]);
    }
  };
  useEffect(() => {
    if (socket) socket.off('chat-message');
    socket.on('chat-message', (message) => handleNewMessage(message));
    return () => {
      if (socket) socket.off('chat-message');
    };
  }, [currentThread]);
  useEffect(() => {
    let subscribed = true;
    if (currentThread && token) {
      axios
        .get(`/api/message/thread/${currentThread}`, {
          headers: { 'x-auth-token': token },
        })
        .then((result) => {
          const data = result.data;
          if (data && Array.isArray(data) && subscribed) {
            setThread(data);
          }
        })
        .catch((err) => console.log(err));
    } else {
      setThread([]);
    }
    return () => (subscribed = false);
  }, [currentThread, token]);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [thread, currentThread]);

  return (
    <div className={classes.thread}>
      {thread.map((message) => (
        <Message key={message._id} props={{ message, userId }} />
      ))}
      <div ref={scrollRef} />
    </div>
  );
};

const Message = ({ props: { message, userId } }) => {
  const classes = useClasses(styles);
  const mine = message.sender._id === userId;
  return (
    <Grid
      className={`${classes.message} ${mine && classes.mine}`}
      container
      direction='column'
    >
      <Grid item>
        <Grid
          container
          alignItems='center'
          className={`${classes.authorSection} ${
            mine && classes.mineAuthorSection
          }`}
        >
          <Link to={`/profile/${message.sender._id}`}>
            <Avatar
              className={classes.senderProfilePic}
              src={`/api/image/${message.sender.profilePic}`}
            >
              {!message.sender.profilePic &&
                message.sender.name &&
                message.sender.name[0].toUpperCase()}
            </Avatar>
          </Link>
          <Typography className={classes.senderName}>
            {message.sender.name}
          </Typography>
        </Grid>
      </Grid>
      <Grid item>
        <Typography className={classes.messageContent}>
          {message.content}
        </Typography>
      </Grid>
    </Grid>
  );
};

const ChatBox = ({ props: { token, currentThread } }) => {
  const classes = useClasses(styles);
  const [inputValue, setInputValue] = useState('');
  const sendMessage = () => {
    if (token && inputValue) {
      setInputValue('');
      axios
        .post(
          '/api/message/new',
          { receiver: currentThread, content: inputValue },
          { headers: { 'x-auth-token': token } }
        )
        .then((res) => console.log(res))
        .catch((err) => console.log(err));
    }
  };
  const handleChange = ({ target: { value } }) => setInputValue(value);
  const handleKeyDown = ({ charCode }) => charCode === 13 && sendMessage();

  return (
    <Grid
      container
      justify='space-around'
      alignItems='flex-end'
      direction='row'
      wrap='nowrap'
      className={classes.chatbox}
    >
      <Grid
        item
        component={Input}
        className={classes.input}
        value={inputValue}
        onKeyPress={handleKeyDown}
        onChange={handleChange}
      />
      <Grid
        item
        component={Button}
        className={classes.sendBtn}
        onClick={sendMessage}
      >
        send
      </Grid>
    </Grid>
  );
};
export default Messages;
