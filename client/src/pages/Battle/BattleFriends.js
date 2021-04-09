import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CTX } from 'context/Store';
import { Link } from 'react-router-dom';
import { makeStyles, Avatar, Typography, Grid } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  battleFriends: {
    background: 'linear-gradient(#ccc, #ddd)',
    padding: '2em',
  },
  friend: {
    padding: '1em',
    borderRadius: '4px',
    background: '#111',
    margin: '.5em',
  },
  friendName: {
    fontSize: '2rem',
    margin: '0 .5em',
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.2rem',
    },
  },
  link: {
    fontSize: '2rem',
    color: theme.palette.secondary.main,
    fontWeight: 'bold',
    '&:hover': {
      color: theme.palette.secondary.light,
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '1rem',
    },
  },
  friendPic: {
    background: theme.palette.primary.main,
  },
}));
const BattleFriends = () => {
  const classes = useStyles();
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
    <Grid container justify='center' className={classes.battleFriends}>
      {friendlist.map(({ _id, receiver, sender }) => (
        <Friend
          key={_id}
          props={{ friend: sender._id === id ? receiver : sender, _id }}
        />
      ))}
    </Grid>
  );
};

const Friend = ({ props: { friend, _id } }) => {
  const classes = useStyles();
  return (
    <Grid
      container
      alignItems='center'
      justify='center'
      className={classes.friend}
    >
      <Grid
        item
        className={classes.friendPic}
        component={Avatar}
        src={`/api/images/${friend.profilePic}`}
      />

      <Grid item={Typography} className={classes.friendName}>
        {friend.name}
      </Grid>
      <Grid
        item
        className={classes.link}
        component={Link}
        to={`/friendbattle/${_id}`}
      >
        connect for battle
      </Grid>
    </Grid>
  );
};

export default BattleFriends;
