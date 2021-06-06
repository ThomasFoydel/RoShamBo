import React from 'react';
import hands from 'imgs/instructions.gif';
import { makeStyles } from '@material-ui/core';
const useStyles = makeStyles(() => ({
  container: {
    marginTop: '6em',
    padding: '0 3em',
    paddingBottom: '6em',
  },
  hands: {
    width: '85%',
    maxWidth: '600px',
    minWidth: '260px',
    objectFit: 'contain',
    padding: '0 3em',
  },
}));
const HowTo = () => {
  const classes = useStyles();
  return (
    <center className={classes.container}>
      <h3>Instructions</h3>
      <img
        src={hands}
        className={classes.hands}
        alt='rock paper scissors bird and tree gestures'
      />
      <p>When a battle starts your opponent will disappear</p>
      <p>You must throw one of these hand gestures</p>
      <p>After a few moments, your weapon will be selected</p>
      <p>Your opponent will reappear for the outcome</p>
      <p>For best results, use good lighting</p>
      <p>and a background that contrasts with your skin</p>
    </center>
  );
};

export default HowTo;
