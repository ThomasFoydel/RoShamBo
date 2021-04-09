import React from 'react';
import { Link } from 'react-router-dom';
import { makeStyles, Grid, Typography } from '@material-ui/core';
import PeopleIcon from '@material-ui/icons/People';
import ComputerIcon from '@material-ui/icons/Computer';
import CasinoIcon from '@material-ui/icons/Casino';

const useStyles = makeStyles((theme) => ({
  battlePage: {
    ...theme.centerHorizontal,
    background: 'linear-gradient(#ccc, #ddd)',
  },
  battleLink: {
    margin: '1em',
  },
  link: {
    padding: '1em',
    borderRadius: '4px',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: '#111',
      '& $text': {
        color: theme.palette.secondary.main,
      },
      '& $icon': {
        color: theme.palette.primary.main,
      },
    },
  },
  text: {
    color: theme.palette.primary.dark,
    fontSize: '2rem',
    fontWeight: 'bold',
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.4rem',
    },
  },
  icon: {
    width: '100%',
    height: '100%',
    color: theme.palette.primary.dark,
  },
}));
const options = [
  { link: 'friends', text: 'Friends', icon: PeopleIcon },
  { link: 'computer', text: 'Computer', icon: ComputerIcon },
  { link: 'random', text: 'Random User', icon: CasinoIcon },
];
const Battle = () => {
  const classes = useStyles();
  return (
    <Grid
      container
      direction='row'
      justify='space-around'
      className={classes.battlePage}
    >
      {options.map((option) => {
        const Icon = option.icon;
        return (
          <Grid key={option.link} item className={classes.battleLink}>
            <Grid
              container
              direction='column'
              alignItems='center'
              component={Link}
              to={`/battle/${option.link}`}
              className={classes.link}
            >
              <Icon className={classes.icon} />
              <Typography className={classes.text}>{option.text}</Typography>
            </Grid>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default Battle;
