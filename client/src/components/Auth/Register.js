import { Lock } from '@mui/icons-material'
import { Typography, Grid, Paper, Avatar, TextField, Button } from '@mui/material'
import useClasses from 'customHooks/useClasses'

const styles = (theme) => ({
  register: {
    maxWidth: '500px',
    minWidth: '275px',
    padding: '2rem 4rem',
    [theme.breakpoints.down('xs')]: {
      padding: '2rem 2rem',
    },
  },
  avatar: {
    backgroundColor: theme.palette.common.blue,
  },
  button: {
    margin: '8px 0',
  },
  header: { fontFamily: 'OpenDyslexic' },
  loginLink: {
    color: theme.palette.primary.dark,
    cursor: 'pointer',
    '&:hover': {
      color: theme.palette.primary.main,
    },
  },
  input: {
    margin: '.4rem 0',
  },
})

const Register = ({ props: { handleAuth, setAuthPage, formState, setFormState } }) => {
  const { name, email, password, confirmpassword } = formState.register
  const classes = useClasses(styles)

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
    <Paper elevation={10} className={classes.register}>
      <Grid align="center">
        <Avatar className={classes.avatar}>
          <Lock />
        </Avatar>
        <h2 className={classes.header}>Register</h2>
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
          className={classes.input}
        />
        <TextField
          required
          id="name"
          fullWidth
          value={name}
          label="Name"
          onChange={handleChange}
          autoComplete="username"
          placeholder="Enter name"
          className={classes.input}
        />
        <TextField
          required
          fullWidth
          type="password"
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
          <span className={classes.loginLink} onClick={() => setAuthPage('login')}>
            Sign In
          </span>
        </Typography>
      </form>
    </Paper>
  )
}

export default Register
