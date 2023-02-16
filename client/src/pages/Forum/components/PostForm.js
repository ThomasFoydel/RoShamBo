import axios from 'axios'
import { toast } from 'react-toastify'
import React, { useState } from 'react'
import { Stack, Button, Input } from '@mui/material'
import useClasses from 'customHooks/useClasses'

const styles = (theme) => ({
  form: {
    ...theme.centerHorizontal,
    width: '80%',
    padding: '2em',
    maxWidth: '400px',
    borderRadius: '4px',
    background: 'linear-gradient(to bottom right, #bbb, #eee)',
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
