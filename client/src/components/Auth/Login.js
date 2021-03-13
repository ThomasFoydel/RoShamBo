import React from 'react';
import { FormControl, Input, InputLabel, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  login: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '24rem',
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
    <div className={classes.login}>
      <h2>Login</h2>
      <FormControl>
        <InputLabel htmlFor='email'>Email address</InputLabel>
        <Input
          id='email'
          value={email}
          onChange={handleChange}
          onKeyPress={handleKeyDown}
        />
      </FormControl>
      <FormControl>
        <InputLabel htmlFor='password'>Password</InputLabel>
        <Input
          id='password'
          value={password}
          onChange={handleChange}
          type='password'
          onKeyPress={handleKeyDown}
        />
      </FormControl>
      <Button id='login' onClick={handleAuth}>
        Sign in
      </Button>
      <Button onClick={() => setAuthPage('register')}>Sign up</Button>
    </div>
  );
};

export default Login;
