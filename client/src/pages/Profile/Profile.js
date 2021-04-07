import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { CTX } from 'context/Store';
import { Link } from 'react-router-dom';
import {
  Avatar,
  makeStyles,
  Card,
  Typography,
  Button,
} from '@material-ui/core';
import rps from 'imgs/rps.jpeg';
import loadingblue from 'imgs/loadingblue.gif';

const useStyles = makeStyles((theme) => ({
  profilePage: { padding: '5rem 0' },
  profilePic: {
    width: '15rem',
    height: '15rem',
    fontSize: '4.8rem',
    backgroundColor: theme.palette.primary.light,
    zIndex: 200,
    position: 'absolute',
    left: '50%',
    transition: 'all 0.8s ease',
    transform: 'translateX(-50%) translateY(-15.5rem)',
    [theme.breakpoints.down('sm')]: {
      width: '12rem',
      height: '12rem',
    },
  },
  background: {
    background: `linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.9) 60%), url(${rps})`,
    bacgkroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    top: 0,
    left: 0,
    minWidth: '100vw',
    minHeight: '100vh',
    position: 'fixed',
  },
  card: {
    ...theme.centerHorizontal,
    background: '#ddd',
    overflow: 'visible',
    display: 'flex',
    flexDirection: 'column',
    padding: '8rem 0',
    alignItems: 'center',
    width: '90vw',
    marginTop: '8rem',
    minHeight: '25rem',
  },
  infoSection: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  username: {
    textAlign: 'center',
    width: '100%',
    fontSize: '3rem',
    [theme.breakpoints.down('sm')]: {
      fontSize: '2rem',
    },
  },
  editLink: { textAlign: 'center', minWidth: '100%' },
  email: {},
  requestButton: {
    color: 'white',
    background: theme.palette.primary.main,
    '&:hover': {
      background: theme.palette.primary.dark,
    },
  },
}));
const Profile = ({
  match: {
    params: { id },
  },
}) => {
  const [appState, updateState] = useContext(CTX);
  const classes = useStyles();

  const [user, setUser] = useState({});
  const [friendshipExists, setFriendshipExists] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const isCurrentUser = id === appState.user.id;

  useEffect(() => {
    let subscribed = true;
    setLoading(true);
    axios
      .get(`/api/user/profile/${id}`, {
        headers: { 'x-auth-token': appState.auth.token },
      })
      .then(({ data: { user, friendshipExists } }) => {
        if (subscribed) {
          setTimeout(() => {
            setUser(user);
            setFriendshipExists(friendshipExists);
            setLoading(false);
          }, 1200);
        }
      })
      .catch(() => {
        if (subscribed) {
          setTimeout(() => {
            setErr('No user found');
            setLoading(false);
          }, 1200);
        }
      });
    return () => (subscribed = false);
  }, [appState.auth.token]);

  const requestFriend = () => {
    axios
      .post(
        '/api/user/friendrequest/',
        { id },
        {
          headers: { 'x-auth-token': appState.auth.token },
        }
      )
      .then(() => setFriendshipExists(true))
      .catch(() => {
        setErr('Something went wrong, friend request not created');
      });
  };

  const [backgroundPosition, setBackgroundPosition] = useState(null);
  useEffect(() => {
    setBackgroundPosition(
      ['left', 'center', 'right'][Math.floor(Math.random() * 3)]
    );
  }, []);

  return (
    <div className={classes.profilePage}>
      {backgroundPosition && (
        <div
          className={classes.background}
          style={{ backgroundPosition: `${backgroundPosition} bottom` }}
        ></div>
      )}
      <Card className={`${classes.card} `}>
        <Avatar
          className={classes.profilePic}
          alt={user.name || 'loading'}
          src={
            loading || !user.name
              ? loadingblue
              : `/api/image/${user.profilePic}`
          }
        >
          {!user.profilePic && user.name && user.name[0].toUpperCase()}
        </Avatar>
        <div className={classes.infoSection}>
          <Typography className={classes.username}>
            {user.name || 'loading'}
          </Typography>

          {user.displayEmail && (
            <Typography className={classes.email}>
              {user.displayEmail}
            </Typography>
          )}
          {user.bio && (
            <Typography className={classes.email}>{user.bio}</Typography>
          )}
          {!isCurrentUser && !friendshipExists && (
            <Button className={classes.requestButton} onClick={requestFriend}>
              request friendship
            </Button>
          )}
          {isCurrentUser && !loading && (
            <Typography
              className={classes.editLink}
              component={Link}
              to='/editprofile'
            >
              edit profile
            </Typography>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Profile;
