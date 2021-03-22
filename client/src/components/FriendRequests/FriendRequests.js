import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CTX } from 'context/Store';

const FriendRequests = () => {
  const [appState, updateState] = useContext(CTX);
  const token = appState.auth.token;
  const [friendRequests, setFriendRequests] = useState([]);
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
    <div>
      <h3>FriendRequests</h3>
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
