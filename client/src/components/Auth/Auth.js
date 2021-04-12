import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Modal, makeStyles } from '@material-ui/core';

import { CTX } from 'context/Store';
import Register from './Register';
import Login from './Login';

const useStyles = makeStyles((theme) => ({
  modalBody: {
    position: 'absolute',
    // width: 400,
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

  const toggleModal = () => {
    updateState({ type: 'TOGGLE_AUTH_MODAL' });
  };

  const handleAuth = ({ currentTarget: { id } }) => {
    axios
      .post(`/api/auth/${id}`, formState[id])
      .then(({ data }) => {
        const { token, user } = data;
        updateState({ type: 'LOGIN', payload: { token, user } });
        setFormState(initialState);
      })
      .catch(
        ({
          response: {
            data: { err },
          },
        }) => {
          if (err) return console.log('handleAuth err: ', err);
        }
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

  return (
    <Modal className={classes.modal} open={authModal} onClose={toggleModal}>
      {ModalBody}
    </Modal>
  );
};

export default Auth;
