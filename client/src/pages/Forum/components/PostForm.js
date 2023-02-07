import axios from 'axios'
import React, { useState } from 'react'
import { Stack, Button, Input } from '@mui/material'
import useClasses from 'customHooks/useClasses'

const styles = (theme) => ({
  form: {
    ...theme.centerHorizontal,
    background: 'linear-gradient(to bottom right, #bbb, #eee)',
    width: '80%',
    padding: '2em',
    maxWidth: '400px',
    borderRadius: '4px',
  },
  input: {
    width: '100%',
    padding: '1em',
    margin: '.5em 0',
    background: 'white',
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
  const classes = useClasses(styles)
  const [form, setForm] = useState(initialState)

  const makePost = (e) => {
    e.preventDefault()
    if (form.content && form.title) {
      setForm(initialState)
      axios
        .post('/api/forum/post', form, { headers: { 'x-auth-token': token } })
        .then(({ data }) => setPosts((posts) => [data, ...posts]))
        .catch((err) => console.error('new post error ', err))
    }
  }

  const handleChange = ({ target: { id, value } }) => {
    setForm((f) => ({ ...f, [id]: value }))
  }

  return (
    <form onSubmit={makePost}>
      <Stack
        direction="column"
        alignItems="center"
        justifyContent="center"
        className={classes.form}
      >
        <Input
          id="title"
          value={form.title}
          placeholder="title"
          onChange={handleChange}
          className={classes.input}
        />

        <Input
          id="content"
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
