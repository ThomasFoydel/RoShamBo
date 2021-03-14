import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = ({
  match: {
    params: { id },
  },
}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  useEffect(() => {
    let subscribed = true;
    setLoading(true);
    axios
      .get(`/api/user/${id}`)
      .then(({ user }) => {
        if (subscribed) setUser(user);
        setLoading(false);
      })
      .catch((err) => {
        setErr(err);
        setLoading(false);
      });
    return () => (subscribed = false);
  }, []);
  return <div>profile</div>;
};

export default Profile;
