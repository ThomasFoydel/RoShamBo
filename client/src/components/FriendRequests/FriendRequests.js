import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CTX } from 'context/Store';
import { makeStyles } from '@material-ui/core';
const useStyles = makeStyles((theme) => ({
  friendRequests: {
    ...theme.centerHorizontal,
    fontFamily: 'OpenDyslexic',
    qidth: '100%',
    textAlign: 'center',
  },
}));
const FriendRequests = () => {
  const [appState] = useContext(CTX);
  const token = appState.auth.token;
  const [friendRequests, setFriendRequests] = useState([]);
  const classes = useStyles();
  useEffect(() => {
    let subscribed = true;
    axios
      .get('/api/user/friendrequests', { headers: { 'x-auth-token': token } })
      .then(({ data }) => subscribed && setFriendRequests(data))
      .catch((err) => console.log({ err }));
    return () => (subscribed = false);
  }, []);
  const accept = ({ target: { id } }) => {
    axios
      .post(
        '/api/user/accept-fr',
        { id },
        { headers: { 'x-auth-token': token } }
      )
      .then(({ data }) => setFriendRequests(data))
      .catch((err) => console.log({ err }));
  };
  const reject = ({ target: { id } }) => {
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
        <FriendRequest key={request._id} props={{ request, reject, accept }} />
      ))}
    </div>
  );
};

const FriendRequest = ({ props: { request, reject, accept } }) => {
  const { _id } = request;
  return (
    <>
      <div>{request.sender.name}</div>
      <button id={_id} onClick={accept}>
        accept
      </button>
      <button id={_id} onClick={reject}>
        reject
      </button>
    </>
  );
};
export default FriendRequests;
