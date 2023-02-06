import axios from 'axios'
import Alert from '@material-ui/lab/Alert'
import { Redirect } from 'react-router-dom'
import React, { useState, useContext } from 'react'
import { Modal, makeStyles, Snackbar } from '@material-ui/core'
import { CTX } from 'context/Store'
import Register from './Register'
import Login from './Login'

const useStyles = makeStyles((theme) => ({
  modalBody: {
    transform: `translate(-50%, -50%)`,
    backgroundColor: theme.palette.background.paper,
    border: `2px solid ${theme.palette.common.blue}`,
    boxShadow: theme.shadows[5],
    position: 'absolute',
    left: '50%',
    top: '50%',
  },
  modal: { zIndex: '9000 !important' },
}))

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
  const classes = useStyles()

  const closeModal = () => updateState({ type: 'AUTH_MODAL', payload: false })

  const handleAuth = (type) => {
    axios
      .post(`/api/auth/${type}`, formState[type])
      .then(({ data }) => {
        const { token, user } = data
        if (type === 'register') setRedirect(true)
        updateState({ type: 'LOGIN', payload: { token, user } })
        setFormState(initialState)
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
        {redirect && <Redirect to="/howto" />}
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
