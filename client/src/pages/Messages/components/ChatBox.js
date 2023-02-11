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
    background: theme.palette.primary.main,
    '&:hover': {
      background: theme.palette.primary.dark,
    },
  },
})

const ChatBox = ({ props: { token, currentThread } }) => {
  const [inputValue, setInputValue] = useState('')
  const classes = useClasses(styles)

  const sendMessage = () => {
    if (!token || !inputValue) return
    setInputValue('')
    axios
      .post(
        '/api/message/new',
        { receiver: currentThread, content: inputValue },
        { headers: { 'x-auth-token': token } }
      )
      .catch(({ response }) => toast.error(response?.data?.message))
  }

  const handleChange = ({ target: { value } }) => setInputValue(value)

  const handleKeyDown = ({ charCode }) => charCode === 13 && sendMessage()

  return (
    <Grid
      container
      wrap="nowrap"
      direction="row"
      alignItems="flex-end"
      justify="space-around"
      className={classes.chatbox}
    >
      <Grid
        item
        component={Input}
        value={inputValue}
        onChange={handleChange}
        className={classes.input}
        onKeyPress={handleKeyDown}
      />
      <Grid item component={Button} className={classes.sendBtn} onClick={sendMessage}>
        send
      </Grid>
    </Grid>
  )
}

export default ChatBox
