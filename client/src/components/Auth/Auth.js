import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import { Modal, makeStyles, Snackbar } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { CTX } from 'context/Store';
import Register from './Register';
import Login from './Login';

const useStyles = makeStyles((theme) => ({
  modalBody: {
    position: 'absolute',
    backgroundColor: theme.palette.background.paper,
    border: `2px solid ${theme.palette.common.blue}`,
    boxShadow: theme.shadows[5],
    top: '50%',
    left: '50%',
    transform: `translate(-50%, -50%)`,
  },
  modal: {
    zIndex: '9000 !important',
  },
}));

const initialState = {
  register: {
    email: '',
    name: '',
    password: '',
    confirmpassword: '',
  },
  login: {
    email: '',
    password: '',
  },
};

const Auth = () => {
  const [appState, updateState] = useContext(CTX);
  const classes = useStyles();
  let { authModal } = appState;
  const [authPage, setAuthPage] = useState('login');
  const [formState, setFormState] = useState(initialState);
  const [err, setErr] = useState(null);
  const [redirect, setRedirect] = useState(false);

  const closeModal = () => updateState({ type: 'AUTH_MODAL', payload: false });

  const handleAuth = (type) => {
    axios
      .post(`/api/auth/${type}`, formState[type])
      .then(({ data }) => {
        const { token, user } = data;
        if (type === 'register') setRedirect(true);
        updateState({ type: 'LOGIN', payload: { token, user } });
        setFormState(initialState);
      })
      .catch(
        ({
          response: {
            data: { err },
          },
        }) => err && setErr(err)
      );
  };
  const ModalBody = (
    <div className={classes.modalBody}>
      {authPage === 'register' ? (
        <Register
          props={{
            handleAuth,
            setAuthPage,
            formState,
            setFormState,
          }}
        />
      ) : (
        <Login
          props={{
            handleAuth,
            setAuthPage,
            formState,
            setFormState,
          }}
        />
      )}
    </div>
  );

  const closeErr = () => setErr(null);

  return (
    <Modal className={classes.modal} open={authModal} onClose={closeModal}>
      <>
        {redirect && <Redirect to='/howto' />}
        {ModalBody}
        <Snackbar
          open={err}
          autoHideDuration={5000}
          onClose={closeErr}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert onClose={closeErr} severity='error'>
            {err}
          </Alert>
        </Snackbar>
      </>
    </Modal>
  );
};

export default Auth;
