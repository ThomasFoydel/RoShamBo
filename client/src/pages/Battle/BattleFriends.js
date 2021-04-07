import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CTX } from 'context/Store';
import { Link } from 'react-router-dom';

const BattleFriends = () => {
  const [appState, updateState] = useContext(CTX);
  const { token } = appState.auth;
  const { id } = appState.user;
  const [friendlist, setFriendlist] = useState([]);

  useEffect(() => {
    if (!token) return;
    axios
      .get('/api/user/friendships', { headers: { 'x-auth-token': token } })
      .then(({ data }) => setFriendlist(data))
      .catch((err) => console.log({ err }));
  }, [token]);

  return (
    <div>
      {friendlist.map(({ _id, receiver, sender }) => (
        <Friend
          key={_id}
          props={{ friend: sender._id === id ? receiver : sender, _id }}
        />
      ))}
    </div>
  );
};

const Friend = ({ props: { friend, _id } }) => (
  <div>
    <h4>
      {friend.name}
      <Link to={`/friendbattle/${_id}`}>connect for battle</Link>
    </h4>
  </div>
);

export default BattleFriends;
