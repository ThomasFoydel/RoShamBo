import { Grid, Stack, Typography } from '@mui/material'
import React, { useContext } from 'react'
import useClasses from 'customHooks/useClasses'
import MessageBox from './components/MessageBox'
import ChatBox from './components/ChatBox'
import Friend from './components/Friend'
import { CTX } from 'context/Store'
import { Link } from 'react-router-dom'

const styles = (theme) => ({
  messages: {
    ...theme.centerHorizontal,
    width: '90%',
    color: 'white',
    height: '400px',
    padding: '.5em',
    maxWidth: '50em',
    marginTop: '5em',
    borderRadius: '4px',
    background: 'linear-gradient(#ccc,#ddd)',
  },
  friendList: {
    overflow: 'auto',
    maxHeight: '60vh',
    borderRadius: '4px',
    paddingRight: '1rem',
    background: '#aaaaaaaa',
  },
  noFriends: {
    color: theme.palette.primary.main,
    a: {
      transition: 'all 0.2s ease',
      color: theme.palette.secondary.main,
      '&:hover': {
        color: theme.palette.secondary.dark,
      },
    },
  },
})

const Messages = ({ props: { socketRef } }) => {
  const [{ auth, user, currentThread }, updateState] = useContext(CTX)
  const { id: userId, friends } = user
  const socket = socketRef.current
  const { token } = auth

  const classes = useClasses(styles)

  const handleSelectFriend = (id) => {
    updateState({ type: 'CURRENT_THREAD', payload: id === currentThread ? null : id })
  }

  return (
    <Grid container justify="space-around" spacing={2} wrap="nowrap" className={classes.messages}>
      <Grid item className={classes.friendList} xs={4}>
        {friends &&
          friends.map((friend) => (
            <Friend
              key={friend._id}
              props={{ friend, className: classes.friend, handleSelectFriend }}
            />
          ))}
      </Grid>
      <Grid item xs={8}>
        {!friends ||
          (friends.length === 0 && (
            <Stack className={classes.noFriends}>
              <Typography>No friends yet!</Typography>
              <Typography>
                Go make some new friends by posting in the <Link to="/forum">forum</Link> or by{' '}
                <Link to="/battle/random">battling random people</Link>
              </Typography>
            </Stack>
          ))}
        <MessageBox props={{ currentThread, token, socket, userId }} />
        {currentThread && <ChatBox props={{ token, currentThread }} />}
      </Grid>
    </Grid>
  )
}

export default Messages
