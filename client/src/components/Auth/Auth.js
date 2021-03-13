import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Modal, makeStyles } from '@material-ui/core';
import { CTX } from 'context/Store';
import Register from './Register';
import Login from './Login';

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const Auth = () => {
  const [appState, updateState] = useContext(CTX);
  const classes = useStyles();
  let {
    auth: { token },
    authModal,
  } = appState;
  const [authPage, setAuthPage] = useState('register');
  const [formState, setFormState] = useState({
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
  });

  const toggleModal = () => {
    updateState({ type: 'TOGGLE_AUTH_MODAL' });
  };

  const modalStyle = {
    top: '50%',
    left: '50%',
    transform: `translate(-50%, -50%)`,
  };

  const handleAuth = ({ currentTarget: { id } }) => {
    axios
      .post(`/api/auth/${id}`, formState[id])
      .then(({ data }) => {
        const { token, user } = data;
        updateState({ type: 'LOGIN', payload: { token, user } });
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
    <div style={modalStyle} className={classes.paper}>
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
    <Modal
      open={authModal}
      onClose={toggleModal}
      aria-labelledby='simple-modal-title'
      aria-describedby='simple-modal-description'
    >
      {ModalBody}
    </Modal>
  );
};

export default Auth;
