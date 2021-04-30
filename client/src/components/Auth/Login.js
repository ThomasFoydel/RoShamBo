import React from 'react';
import {
  Typography,
  Grid,
  Paper,
  Avatar,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  makeStyles,
} from '@material-ui/core';
import LockIcon from '@material-ui/icons/Lock';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  login: {
    maxWidth: '500px',
    minWidth: '275px',
    padding: '2rem 4rem',
    [theme.breakpoints.down('xs')]: {
      padding: '2rem 2rem',
    },
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
  },
  button: {
    margin: '8px 0',
  },
  header: {
    fontFamily: 'OpenDyslexic',
  },
  registerLink: {
    color: theme.palette.primary.dark,
    cursor: 'pointer',
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
  forgotPw: {
    color: theme.palette.primary.dark,
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
}));

const Login = ({
  props: { handleAuth, setAuthPage, formState, setFormState },
}) => {
  const classes = useStyles();
  const { email, password } = formState.login;

  const handleChange = ({ target: { value, id } }) => {
    setFormState((formState) => ({
      ...formState,
      login: { ...formState.login, [id]: value },
    }));
  };

  const handleKeyDown = ({ charCode }) => {
    if (charCode === 13) {
      handleAuth('login');
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    handleAuth('login');
  };

  return (
    <Paper elevation={10} className={classes.login}>
      <Grid align='center'>
        <Avatar className={classes.avatar}>
          <LockIcon />
        </Avatar>
        <h2 className={classes.header}>Sign In</h2>
      </Grid>
      <form onSubmit={handleSubmit}>
        <TextField
          label='Email'
          placeholder='Enter email'
          fullWidth
          id='email'
          required
          value={email}
          onChange={handleChange}
          onKeyPress={handleKeyDown}
          autoComplete='email'
        />
        <TextField
          label='Password'
          placeholder='Enter password'
          id='password'
          type='password'
          fullWidth
          required
          value={password}
          onChange={handleChange}
          onKeyPress={handleKeyDown}
          autoComplete='current-password'
        />
        <FormControlLabel
          control={<Checkbox name='checkedB' color='primary' />}
          label='Remember me'
        />
        <Button
          className={classes.button}
          type='submit'
          color='primary'
          variant='contained'
          fullWidth
        >
          Sign in
        </Button>
        <Typography>
          <Link className={classes.forgotPw} to='/forgot-pw'>
            Forgot password?
          </Link>
        </Typography>
        <Typography>
          Need an account?{' '}
          <span
            className={classes.registerLink}
            onClick={() => setAuthPage('register')}
          >
            Sign Up
          </span>
        </Typography>
      </form>
    </Paper>
  );
};

export default Login;
