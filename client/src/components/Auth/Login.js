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

const Login = ({ props: { handleAuth, setAuthPage, formState, setFormState, classes } }) => {
  const { email, password } = formState.login

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
    <Paper elevation={10} className={classes.authPaper}>
      <Grid align="center">
        <Avatar className={classes.avatar}>
          <Lock />
        </Avatar>
        <h2>Sign In</h2>
      </Grid>
      <form onSubmit={handleSubmit}>
        <TextField
          required
          fullWidth
          id="email"
          value={email}
          label="Email"
          variant="standard"
          autoComplete="email"
          onChange={handleChange}
          className={classes.input}
          placeholder="Enter email"
        />
        <TextField
          required
          fullWidth
          id="password"
          type="password"
          value={password}
          label="Password"
          variant="standard"
          onChange={handleChange}
          className={classes.input}
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
          <button className={classes.switch} onClick={() => setAuthPage('register')}>
            Sign Up
          </button>
        </Typography>
      </form>
    </Paper>
  )
}

export default Login
