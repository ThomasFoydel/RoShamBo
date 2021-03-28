import React from 'react';
import FriendRequests from 'components/FriendRequests/FriendRequests';
import hands from 'imgs/hands.gif';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  hands: {
    ...theme.centerHorizontal,
  },
}));
const Home = () => {
  const classes = useStyles();
  return (
    <div className={classes.home}>
      <div className={classes.handBackground}></div>
      <img src={hands} className={classes.hands} alt='hand scissor gesture' />
      <FriendRequests />
    </div>
  );
};

export default Home;
