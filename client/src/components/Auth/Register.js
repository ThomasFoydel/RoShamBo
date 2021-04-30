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

const useStyles = makeStyles((theme) => ({
  register: {
    maxWidth: '500px',
    minWidth: '275px',
    padding: '2rem 4rem',
    [theme.breakpoints.down('xs')]: {
      padding: '2rem 2rem',
    },
  },
  avatar: {
    backgroundColor: theme.palette.common.blue,
  },
  button: {
    margin: '8px 0',
  },
  header: { fontFamily: 'OpenDyslexic' },
  loginLink: {
    color: theme.palette.primary.dark,
    cursor: 'pointer',
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
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
      handleAuth('register');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAuth('register');
  };

  return (
    <Paper elevation={10} className={classes.register}>
      <Grid align='center'>
        <Avatar className={classes.avatar}>
          <LockIcon />
        </Avatar>
        <h2 className={classes.header}>Register</h2>
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
          label='Name'
          placeholder='Enter name'
          fullWidth
          id='name'
          required
          value={name}
          onChange={handleChange}
          onKeyPress={handleKeyDown}
          autoComplete='username'
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
          autoComplete='new-password'
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
          autoComplete='new-password'
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
          Sign up
        </Button>

        <Typography>
          Already have an account?
          <span
            className={classes.loginLink}
            onClick={() => setAuthPage('login')}
          >
            Sign In
          </span>
        </Typography>
      </form>
    </Paper>
  );
};

export default Register;
