import React, { useContext } from 'react';
import { makeStyles, Typography, Button } from '@material-ui/core';
import weaponSystem from 'imgs/weaponsystem.png';
import { CTX } from 'context/Store';
const useStyles = makeStyles((theme) => ({
  container: {
    background: 'white',
  },
  title: {
    textAlign: 'center',
    fontSize: '6rem',
    letterSpacing: '1rem',
    marginLeft: '1rem',
    backgroundImage: `linear-gradient(to bottom right, ${theme.palette.secondary.light}, ${theme.palette.primary.main})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    [theme.breakpoints.down('sm')]: {
      fontSize: '3.5rem',
      letterSpacing: '.3rem',
      marginLeft: '.3rem',
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '2.5rem',
      letterSpacing: '.2rem',
      marginLeft: '.2rem',
    },
  },
  weaponSystem: {
    border: '8px solid black',
    borderBottom: 'none',
    background: `radial-gradient(${theme.palette.secondary.dark}, ${theme.palette.primary.main})`,
    width: '100%',
  },
  startBtn: {
    position: 'absolute',
    top: '52%',
    left: '50%',

    transform: 'translateX(-50%) translateY(-50%)',
    padding: '.5rem 2.5rem',
    fontSize: '5rem',
    boxShadow:
      '.5rem .5rem 1rem rgba(0,0,0,0.2), -.5rem -.5rem 1.5rem rgba(255,255,255,0.15)',
    backdropFilter: 'blur(2px)',
    transition: 'all 0.45s ease',
    whiteSpace: 'nowrap',
    background: theme.palette.secondary.light,
    color: '#ddd',
    '&:hover': {
      background: 'rgba(255,255,255,0.15)',
      color: '#fff',
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '2rem',
      padding: '.2rem 1rem',
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.4rem',
      padding: '.2rem 1rem',
    },
  },
}));
const Landing = () => {
  const [, updateState] = useContext(CTX);

  const classes = useStyles();
  const openModal = () => updateState({ type: 'AUTH_MODAL', payload: true });
  return (
    <>
      <div style={{ position: 'relative' }}>
        <img
          className={classes.weaponSystem}
          src={weaponSystem}
          alt='weapons system: scisscors beats bird and paper. paper beats tree and rock. rock beats bird and scissors. tree beats rock and scissors. '
        />
        <Button onClick={openModal} className={classes.startBtn}>
          Get Started
        </Button>
      </div>
      <div className={classes.container}>
        <Typography className={classes.title}>ROSHAMBO</Typography>
      </div>
    </>
  );
};

export default Landing;
