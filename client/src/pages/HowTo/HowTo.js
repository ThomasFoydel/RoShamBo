import React from 'react';
import hands from 'imgs/instructions.gif';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
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
  link: {
    color: theme.palette.primary.main,
    '&:hover': {
      color: theme.palette.primary.light,
    },
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
      <br />
      <p>
        Find new friends in the{' '}
        <Link to='/forum' className={classes.link}>
          forum
        </Link>
      </p>
      <p>
        Start battles on the{' '}
        <Link to='/battle' className={classes.link}>
          battle page
        </Link>
      </p>
      <p>
        Manage your{' '}
        <Link to='/editprofile' className={classes.link}>
          profile info
        </Link>
      </p>
      <p>
        Or{' '}
        <Link to='/messages' className={classes.link}>
          message
        </Link>{' '}
        your friends
      </p>
    </center>
  );
};

export default HowTo;
