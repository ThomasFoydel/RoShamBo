import React from 'react';
import { makeStyles, Typography, Button } from '@material-ui/core';
import weaponSystem from 'imgs/weaponsystem.png';
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
    borderTop: '8px solid black',
    background: `radial-gradient(${theme.palette.secondary.dark}, ${theme.palette.primary.main})`,
    width: '100vw',
  },
}));
const Landing = () => {
  const classes = useStyles();
  return (
    <div>
      <img className={classes.weaponSystem} src={weaponSystem} />
      <div className={classes.container}>
        <Typography className={classes.title}>ROSHAMBO</Typography>
      </div>
    </div>
  );
};

export default Landing;
