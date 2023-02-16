import axios from 'axios'
import { toast } from 'react-toastify'
import React, { useState } from 'react'
import { Stack, Button, TextField } from '@mui/material'
import useClasses from 'customHooks/useClasses'

const styles = (theme) => ({
  form: {
    ...theme.centerHorizontal,
    width: '80%',
    padding: '2em',
    maxWidth: '400px',
    borderRadius: '4px',
    backgroundColor: theme.palette.background.paper,
  },
  input: {
    width: '100%',
    margin: '.2rem 0',
  },
  button: {
    color: 'white',
    width: '12rem',
    padding: '1em',
    marginTop: '1rem',
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
})

const initialState = { title: '', content: '' }

const PostForm = ({ props: { setPosts, token } }) => {
  const [form, setForm] = useState(initialState)
  const classes = useClasses(styles)

  const makePost = (e) => {
    e.preventDefault()
    if (!form.content || !form.title) return toast.error('All fields required')
    axios
      .post('/api/forum/posts', form, { headers: { 'x-auth-token': token } })
      .then(({ data }) => {
        setPosts((posts) => [data.post, ...posts])
        setForm(initialState)
      })
      .catch(({ response }) => toast.error(response?.data?.message))
  }

  const handleChange = ({ target: { id, value } }) => setForm((f) => ({ ...f, [id]: value }))

  return (
    <form onSubmit={makePost}>
      <Stack
        direction="column"
        alignItems="center"
        justifyContent="center"
        className={classes.form}
      >
        <TextField
          id="title"
          label="title"
          variant="standard"
          value={form.title}
          placeholder="title"
          onChange={handleChange}
          className={classes.input}
        />

        <TextField
          id="content"
          label="content"
          variant="standard"
          value={form.content}
          placeholder="content"
          onChange={handleChange}
          className={classes.input}
        />

        <Button className={classes.button} type="submit">
          submit
        </Button>
      </Stack>
    </form>
  )
}

export default PostForm
