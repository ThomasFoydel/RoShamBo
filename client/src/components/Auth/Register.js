import { Lock } from '@mui/icons-material'
import { Typography, Grid, Paper, Avatar, TextField, Button } from '@mui/material'

const Register = ({ props: { handleAuth, setAuthPage, formState, setFormState, classes } }) => {
  const { name, email, password, confirmpassword } = formState.register

  const handleChange = ({ target: { value, id } }) => {
    setFormState((formState) => ({
      ...formState,
      register: { ...formState.register, [id]: value },
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleAuth('register')
  }

  return (
    <Paper elevation={10} className={classes.authPaper}>
      <Grid align="center">
        <Avatar className={classes.avatar}>
          <Lock />
        </Avatar>
        <h2>Register</h2>
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
          placeholder="Enter email"
          className={classes.input}
        />
        <TextField
          required
          id="name"
          fullWidth
          value={name}
          label="Name"
          variant="standard"
          onChange={handleChange}
          autoComplete="username"
          placeholder="Enter name"
          className={classes.input}
        />
        <TextField
          required
          fullWidth
          type="password"
          variant="standard"
          id="confirmpassword"
          value={confirmpassword}
          onChange={handleChange}
          label="Confirm password"
          className={classes.input}
          autoComplete="new-password"
          placeholder="Enter password"
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
          autoComplete="new-password"
          placeholder="Enter password"
        />
        <Button
          fullWidth
          type="submit"
          color="primary"
          variant="contained"
          className={classes.button}
        >
          Sign up
        </Button>

        <Typography>
          Already have an account?{' '}
          <button className={classes.switch} onClick={() => setAuthPage('login')}>
            Sign In
          </button>
        </Typography>
      </form>
    </Paper>
  )
}

export default Register
