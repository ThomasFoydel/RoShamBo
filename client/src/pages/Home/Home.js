import React from 'react';
import FriendRequests from 'components/FriendRequests/FriendRequests';
import hands from 'imgs/hands.gif';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  hands: {
    ...theme.centerHorizontal,
    width: '100vw',
    opacity: '0.7',
    bottom: '0',
    position: 'absolute',
  },
}));
const Home = () => {
  const classes = useStyles();
  return (
    <div className={classes.home}>
      <img
        src={hands}
        className={classes.hands}
        alt='two hands throwing scissors and paper'
      />
      <FriendRequests />
    </div>
  );
};

export default Home;
