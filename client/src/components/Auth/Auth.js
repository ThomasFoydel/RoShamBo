import axios from 'axios'
import { Dialog } from '@mui/material'
import { toast } from 'react-toastify'
import { Navigate, useLocation } from 'react-router-dom'
import React, { useState, useContext, useEffect } from 'react'
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
    [theme.breakpoints.down('sm')]: {
      minWidth: '225px',
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
    '&:hover': {
      color: theme.palette.primary.main,
    },
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
  const classes = useClasses(styles)
  const { pathname } = useLocation()

  const closeModal = () => updateState({ type: 'AUTH_MODAL', payload: false })

  const handleAuth = (type, remember) => {
    axios
      .post(`/api/auth/${type}`, formState[type])
      .then(({ data }) => {
        const { token, user } = data
        updateState({ type: 'LOGIN', payload: { token, user, remember } })
        setFormState(initialState)
        setRedirect(true)
        closeModal()
      })
      .catch(({ response }) => toast.error(response?.data?.message || type + ' failed'))
  }

  useEffect(() => {
    if (pathname === '/howto') setRedirect(false)
  }, [pathname])

  const props = { formState, handleAuth, setAuthPage, setFormState, classes }

  return (
    <Dialog open={authModal} onClose={closeModal} PaperProps={{ className: classes.modalBody }}>
      {redirect && pathname !== '/howto' && <Navigate to="/howto" />}
      {authPage === 'register' ? <Register props={props} /> : <Login props={props} />}
    </Dialog>
  )
}

export default Auth
