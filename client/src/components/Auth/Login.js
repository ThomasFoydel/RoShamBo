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
    padding: '2rem 4rem',
  },
  avatar: {
    backgroundColor: theme.palette.common.blue,
  },
  button: {
    margin: '8px 0',
  },
  header: {
    fontFamily: 'OpenDyslexic',
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
      handleAuth({ currentTarget: { id: 'login' } });
    }
  };

  return (
    <Paper elevation={10} className={classes.login}>
      <Grid align='center'>
        <Avatar className={classes.avatar}>
          <LockIcon />
        </Avatar>
        <h2 className={classes.header}>Sign In</h2>
      </Grid>

      <TextField
        label='Email'
        placeholder='Enter email'
        fullWidth
        id='email'
        required
        value={email}
        onChange={handleChange}
        onKeyPress={handleKeyDown}
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
      />
      <FormControlLabel
        control={<Checkbox name='checkedB' color='primary' />}
        label='Remember me'
      />
      <Button
        className={classes.button}
        onClick={handleAuth}
        type='submit'
        color='primary'
        variant='contained'
        fullWidth
        id='login'
      >
        Sign in
      </Button>
      <Typography>
        <Link to='/forgot-pw'>Forgot password?</Link>
      </Typography>
      <Typography>
        Need an account?{' '}
        <Link onClick={() => setAuthPage('register')}>Sign Up</Link>
      </Typography>
    </Paper>
  );
};

export default Login;
