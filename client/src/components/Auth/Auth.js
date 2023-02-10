import axios from 'axios'
import { Alert } from '@mui/lab'
import { Navigate } from 'react-router-dom'
import React, { useState, useContext } from 'react'
import { Modal, Snackbar } from '@mui/material'
import useClasses from 'customHooks/useClasses'
import { CTX } from 'context/Store'
import Register from './Register'
import Login from './Login'

const styles = (theme) => ({
  modalBody: {
    top: '50%',
    left: '50%',
    position: 'absolute',
    boxShadow: theme.shadows[5],
    transform: `translate(-50%, -50%)`,
    backgroundColor: theme.palette.background.paper,
    border: `2px solid ${theme.palette.common.blue}`,
  },
  modal: {
    zIndex: '9000 !important',
  },
})

const initialState = {
  register: {
    name: '',
    email: '',
    password: '',
    confirmpassword: '',
  },
  login: {
    email: '',
    password: '',
  },
}

const Auth = () => {
  const [{ authModal }, updateState] = useContext(CTX)
  const [formState, setFormState] = useState(initialState)
  const [authPage, setAuthPage] = useState('login')
  const [redirect, setRedirect] = useState(false)
  const [err, setErr] = useState(null)
  const classes = useClasses(styles)

  const closeModal = () => updateState({ type: 'AUTH_MODAL', payload: false })

  const handleAuth = (type, remember) => {
    console.log('handleAuth: ', { type, remember })
    axios
      .post(`/api/auth/${type}`, formState[type])
      .then(({ data }) => {
        const { token, user } = data
        if (type === 'register') setRedirect(true)
        else {
          updateState({ type: 'LOGIN', payload: { token, user, remember } })
          setFormState(initialState)
        }
      })
      .catch((err) => setErr(err.data.err))
  }

  const props = { formState, handleAuth, setAuthPage, setFormState }

  const ModalBody = (
    <div className={classes.modalBody}>
      {authPage === 'register' ? <Register props={props} /> : <Login props={props} />}
    </div>
  )

  const closeErr = () => setErr(null)

  return (
    <Modal className={classes.modal} open={authModal} onClose={closeModal}>
      <>
        {redirect && <Navigate to="/howto" />}
        {ModalBody}
        <Snackbar
          open={err}
          onClose={closeErr}
          autoHideDuration={5000}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert onClose={closeErr} severity="error">
            {err}
          </Alert>
        </Snackbar>
      </>
    </Modal>
  )
}

export default Auth
