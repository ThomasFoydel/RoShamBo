import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CTX } from 'context/Store';
import { Link } from 'react-router-dom';

const Profile = ({
  match: {
    params: { id },
  },
}) => {
  const [appState, updateState] = useContext(CTX);

  const [user, setUser] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const isCurrentUser = id === appState.user.id;
  useEffect(() => {
    let subscribed = true;
    setLoading(true);
    axios
      .get(`/api/user/${id}`, {
        headers: { 'x-auth-token': appState.auth.token },
      })
      .then(({ data: { user, isFriend } }) => {
        if (subscribed) {
          setUser(user);
          setIsFriend(isFriend);
        }
        setLoading(false);
      })
      .catch(() => {
        setErr('No user found');
        setLoading(false);
      });
    return () => (subscribed = false);
  }, [appState.auth.token]);

  const requestFriend = () => {
    axios
      .post('/api/user/friendrequest', id, {
        headers: { 'x-auth-token': appState.auth.token },
      })
      .then((result) => {
        console.log(result);
      })
      .catch(() => {
        setErr('Something went wrong, friend request not created');
      });
  };
  return (
    <>
      {loading && <div>loading</div>}
      {user && (
        <div className='profile'>
          {isCurrentUser && <Link to='/editprofile'>edit profile</Link>}
          <span>{user.name}</span>
          <span>{user.email}</span>
          {!isCurrentUser && (
            <button onClick={requestFriend}>request friendship</button>
          )}
        </div>
      )}
    </>
  );
};

export default Profile;
