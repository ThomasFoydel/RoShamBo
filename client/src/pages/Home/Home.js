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
      <div className={classes.handBackground}></div>
      <FriendRequests />
      <img src={hands} className={classes.hands} alt='hand scissor gesture' />
    </div>
  );
};

export default Home;
