import axios from 'axios'
import { toast } from 'react-toastify'
import React, { useState } from 'react'
import { Grid, Input, Button } from '@mui/material'
import useClasses from 'customHooks/useClasses'

const styles = (theme) => ({
  chatbox: { padding: '.5em' },
  input: {
    color: 'white',
  },
  sendBtn: {
    color: 'white',
    marginLeft: '1rem',
    marginRight: '.5rem',
    background: theme.palette.primary.main,
    '&:hover': {
      background: theme.palette.primary.dark,
    },
  },
})

const ChatBox = ({ props: { token, currentThread } }) => {
  const [inputValue, setInputValue] = useState('')
  const classes = useClasses(styles)

  const sendMessage = (e) => {
    e.preventDefault()
    if (!token || !inputValue) return
    axios
      .post(
        '/api/messages',
        { receiver: currentThread, content: inputValue },
        { headers: { 'x-auth-token': token } }
      )
      .then(() => setInputValue(''))
      .catch(({ response }) => toast.error(response?.data?.message))
  }

  const handleChange = ({ target: { value } }) => setInputValue(value)

  return (
    <form onSubmit={sendMessage}>
      <Grid
        container
        wrap="nowrap"
        direction="row"
        alignItems="flex-end"
        justifyContent="flex-end"
        className={classes.chatbox}
      >
        <Grid
          item
          component={Input}
          value={inputValue}
          onChange={handleChange}
          className={classes.input}
        />
        <Grid item component={Button} className={classes.sendBtn} type="submit">
          send
        </Grid>
      </Grid>
    </form>
  )
}

export default ChatBox
