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
import { Link } from 'react-router-dom';
import LockIcon from '@material-ui/icons/Lock';

const useStyles = makeStyles((theme) => ({
  register: {
    padding: '2rem 4rem',
  },
  avatar: {
    backgroundColor: theme.palette.common.blue,
  },
  button: {
    margin: '8px 0',
  },
  header: { fontFamily: 'OpenDyslexic' },
}));

const Register = ({
  props: { handleAuth, setAuthPage, formState, setFormState },
}) => {
  const classes = useStyles();
  const { name, email, password, confirmpassword } = formState.register;

  const handleChange = ({ target: { value, id } }) => {
    setFormState((formState) => ({
      ...formState,
      register: { ...formState.register, [id]: value },
    }));
  };

  const handleKeyDown = ({ charCode }) => {
    if (charCode === 13) {
      handleAuth({ currentTarget: { id: 'register' } });
    }
  };

  return (
    <Paper elevation={10} className={classes.register}>
      <Grid align='center'>
        <Avatar className={classes.avatar}>
          <LockIcon />
        </Avatar>
        <h2 className={classes.header}>Register</h2>
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
        label='Name'
        placeholder='Enter name'
        fullWidth
        id='name'
        required
        value={name}
        onChange={handleChange}
        onKeyPress={handleKeyDown}
      />
      <TextField
        label='Confirm password'
        placeholder='Enter password'
        id='confirmpassword'
        type='password'
        fullWidth
        required
        value={confirmpassword}
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
        id='register'
      >
        Sign up
      </Button>

      <Typography>
        Already have an account?
        <Link onClick={() => setAuthPage('login')}>Sign In</Link>
      </Typography>
    </Paper>
  );
};

export default Register;
