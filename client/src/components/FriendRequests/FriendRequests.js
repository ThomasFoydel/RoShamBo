import axios from 'axios'
import { toast } from 'react-toastify'
import React, { useState, useEffect, useContext } from 'react'
import FriendRequest from './components/FriendRequest'
import useClasses from 'customHooks/useClasses'
import { CTX } from 'context/Store'

const styles = (theme) => ({
  friendRequests: {
    ...theme.centerHorizontal,
    qidth: '100%',
    textAlign: 'center',
    fontFamily: 'OpenDyslexic',
  },
  btn: {
    color: 'white',
    margin: '0 1em',
    background: theme.palette.primary.main,
    '&:hover': {
      background: theme.palette.primary.dark,
    },
  },
})

const FriendRequests = () => {
  const [appState, updateState] = useContext(CTX)
  const token = appState.auth.token
  const [friendRequests, setFriendRequests] = useState([])
  const classes = useClasses(styles)

  useEffect(() => {
    let subscribed = true
    axios
      .get('/api/user/friendships/requests', { headers: { 'x-auth-token': token } })
      .then(({ data: { friendRequests } }) => subscribed && setFriendRequests(friendRequests))
      .catch(({ response }) => toast.error(response?.data?.message))
    return () => (subscribed = false)
  }, [])

  const accept = (id) => {
    axios
      .put('/api/user/friendships', { id, accept: true }, { headers: { 'x-auth-token': token } })
      .then(({ data: { friendRequests, friendList } }) => {
        setFriendRequests(friendRequests)
        toast.success('Freind request accepted')
        updateState({ type: 'SET_FRIENDLIST', payload: friendList })
      })
      .catch(({ response }) => toast.error(response?.data?.message))
  }

  const reject = (id) => {
    axios
      .put('/api/user/friendships', { id, accept: false }, { headers: { 'x-auth-token': token } })
      .then(({ data: { friendRequests } }) => {
        setFriendRequests(friendRequests)
        toast.success('Freind request rejected')
      })
      .catch(({ response }) => toast.error(response?.data?.message))
  }

  return (
    <div className={classes.friendRequests}>
      <h3>{friendRequests.length === 0 ? 'No Pending Frend Requests' : 'Friend Requests: '}</h3>
      {friendRequests.map((request) => (
        <FriendRequest
          key={request._id}
          props={{ request, reject, accept, btnClass: classes.btn }}
        />
      ))}
    </div>
  )
}

export default FriendRequests
