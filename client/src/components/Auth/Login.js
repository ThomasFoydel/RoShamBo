import {
  Grid,
  Paper,
  Button,
  Avatar,
  Checkbox,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Lock } from '@mui/icons-material'
import useClasses from 'customHooks/useClasses'

const styles = (theme) => ({
  login: {
    maxWidth: '500px',
    minWidth: '275px',
    padding: '2rem 4rem',
    [theme.breakpoints.down('xs')]: { padding: '2rem 2rem' },
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
  },
  button: {
    margin: '8px 0',
  },
  header: {
    fontFamily: 'OpenDyslexic',
  },
  registerLink: {
    cursor: 'pointer',
    color: theme.palette.primary.dark,
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
  forgotPw: {
    color: theme.palette.primary.dark,
    '&:hover': { color: theme.palette.primary.main },
  },
})

const Login = ({ props: { handleAuth, setAuthPage, formState, setFormState } }) => {
  const { email, password } = formState.login
  const classes = useClasses(styles)

  const [remember, setRemember] = useState(true)

  const handleChange = ({ target: { value, id } }) => {
    setFormState((formState) => ({ ...formState, login: { ...formState.login, [id]: value } }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleAuth('login', remember)
  }

  const handleRemember = (e) => setRemember(e.target.checked)

  return (
    <Paper elevation={10} className={classes.login}>
      <Grid align="center">
        <Avatar className={classes.avatar}>
          <Lock />
        </Avatar>
        <h2 className={classes.header}>Sign In</h2>
      </Grid>
      <form onSubmit={handleSubmit}>
        <TextField
          required
          fullWidth
          id="email"
          value={email}
          label="Email"
          autoComplete="email"
          onChange={handleChange}
          placeholder="Enter email"
        />
        <TextField
          required
          fullWidth
          id="password"
          type="password"
          value={password}
          label="Password"
          onChange={handleChange}
          placeholder="Enter password"
          autoComplete="current-password"
        />
        <FormControlLabel
          label="Remember me"
          control={
            <Checkbox
              name="Remember me"
              color="primary"
              checked={remember}
              onChange={handleRemember}
            />
          }
        />
        <Button
          fullWidth
          type="submit"
          color="primary"
          variant="contained"
          className={classes.button}
        >
          Sign in
        </Button>
        <Typography>
          <Link className={classes.forgotPw} to="/forgot-pw">
            Forgot password?
          </Link>
        </Typography>
        <Typography>
          Need an account?{' '}
          <span className={classes.registerLink} onClick={() => setAuthPage('register')}>
            Sign Up
          </span>
        </Typography>
      </form>
    </Paper>
  )
}

export default Login
