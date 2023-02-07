import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CTX } from 'context/Store';
import { Button } from '@mui/material';
import useClasses from 'customHooks/useClasses';

const styles = (theme) => ({
  friendRequests: {
    ...theme.centerHorizontal,
    fontFamily: 'OpenDyslexic',
    qidth: '100%',
    textAlign: 'center',
  },
  btn: {
    color: 'white',
    margin: '0 1em',
    background: theme.palette.primary.main,
    '&:hover': {
      background: theme.palette.primary.dark,
    },
  },
});

const FriendRequests = () => {
  const [appState, updateState] = useContext(CTX);
  const token = appState.auth.token;
  const [friendRequests, setFriendRequests] = useState([]);
  const classes = useClasses(styles);
  
  useEffect(() => {
    let subscribed = true;
    axios
      .get('/api/user/friendrequests', { headers: { 'x-auth-token': token } })
      .then(({ data }) => subscribed && setFriendRequests(data))
      .catch((err) => console.log({ err }));
    return () => (subscribed = false);
  }, []);
  const accept = (id) => {
    axios
      .post(
        '/api/user/accept-fr',
        { id },
        { headers: { 'x-auth-token': token } }
      )
      .then(({ data }) => {
        setFriendRequests(data.friendRequests);
        updateState({ type: 'SET_FRIENDLIST', payload: data.friendList });
      })
      .catch((err) => console.log({ err }));
  };
  const reject = (id) => {
    axios
      .post(
        '/api/user/reject-fr',
        { id },
        { headers: { 'x-auth-token': token } }
      )
      .then(({ data }) => setFriendRequests(data))
      .catch((err) => console.log({ err }));
  };
  return (
    <div className={classes.friendRequests}>
      <h3>
        {friendRequests.length === 0
          ? 'No Pending Frend Requests'
          : 'Friend Requests: '}
      </h3>
      {friendRequests.map((request) => (
        <FriendRequest
          key={request._id}
          props={{ request, reject, accept, classes }}
        />
      ))}
    </div>
  );
};

const FriendRequest = ({ props: { request, reject, accept, classes } }) => {
  const { _id } = request;
  return (
    <>
      <div>{request.sender.name}</div>
      <Button className={classes.btn} onClick={() => accept(_id)}>
        accept
      </Button>
      <Button className={classes.btn} onClick={() => reject(_id)}>
        reject
      </Button>
    </>
  );
};
export default FriendRequests;
