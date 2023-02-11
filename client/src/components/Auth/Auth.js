import axios from 'axios'
import { Alert } from '@mui/lab'
import { toast } from 'react-toastify'
import { Navigate } from 'react-router-dom'
import { Dialog, Snackbar } from '@mui/material'
import React, { useState, useContext } from 'react'
import useClasses from 'customHooks/useClasses'
import { CTX } from 'context/Store'
import Register from './Register'
import Login from './Login'

const styles = (theme) => ({
  modalBody: {
    boxShadow: theme.shadows[5],
    backgroundColor: theme.palette.background.paper,
    border: `2px solid ${theme.palette.common.blue}`,
  },
  authPaper: {
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
    marginTop: '1rem',
    marginBottom: '.5rem',
  },
  switch: {
    border: 'none',
    fontSize: '1rem',
    background: 'none',
    color: theme.palette.primary.dark,
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
  forgotPw: {
    color: theme.palette.primary.dark,
    '&:hover': { color: theme.palette.primary.main },
  },
  input: {
    margin: '.2rem 0',
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
      .catch(({ response }) => toast.error(response?.data?.message || type + ' failed'))
  }

  const props = { formState, handleAuth, setAuthPage, setFormState, classes }

  const closeErr = () => setErr(null)

  return (
    <Dialog open={authModal} onClose={closeModal}>
      {redirect && <Navigate to="/howto" />}
      <div className={classes.modalBody}>
        {authPage === 'register' ? <Register props={props} /> : <Login props={props} />}
      </div>
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
    </Dialog>
  )
}

export default Auth
