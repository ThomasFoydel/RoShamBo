import axios from 'axios'
import { toast } from 'react-toastify'
import React, { useState } from 'react'
import { Stack, Input, Button } from '@mui/material'
import useClasses from 'customHooks/useClasses'

const styles = (theme) => ({
  form: {
    ...theme.centerHorizontal,
    width: '80%',
  },
  input: {
    padding: '1em',
    marginRight: '1em',
    [theme.breakpoints.down('xs')]: {
      padding: '.4em',
      marginRight: '.4em',
    },
  },
  button: {
    color: 'white',
    padding: '1em',
    marginLeft: '1em',
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
    [theme.breakpoints.down('xs')]: {
      padding: '.4em',
      marginRight: '.4em',
    },
  },
})

const CommentForm = ({ props: { postId, setPosts, token } }) => {
  const [commentInput, setCommentInput] = useState('')
  const classes = useClasses(styles)

  const makeComment = (e) => {
    e.preventDefault()
    if (commentInput.length > 0 && commentInput.length <= 100) {
      axios
        .post(
          '/api/forum/comments',
          { content: commentInput, postId },
          { headers: { 'x-auth-token': token } }
        )
        .then(({ data }) => {
          setPosts((posts) => {
            const copy = [...posts]
            const post = copy.find((p) => p._id === data.post._id)
            Object.assign(post, data.post)
            return copy
          })
          setCommentInput('')
        })
        .catch(({ response }) => toast.error(response?.data?.message))
    }
  }

  const handleChange = ({ target: { value } }) => setCommentInput(value)

  return (
    <form onSubmit={makeComment}>
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        className={classes.form}
        wrap="nowrap"
      >
        <Input
          className={classes.input}
          onChange={handleChange}
          value={commentInput}
          placeholder="comment"
        />
        <Button className={classes.button} type="submit" background="primary">
          submit
        </Button>
      </Stack>
    </form>
  )
}

export default CommentForm
