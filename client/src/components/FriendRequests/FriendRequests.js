import axios from 'axios'
import { toast } from 'react-toastify'
import React, { useContext } from 'react'
import FriendRequest from './components/FriendRequest'
import useClasses from 'customHooks/useClasses'
import { CTX } from 'context/Store'

const styles = (theme) => ({
  friendRequests: {
    ...theme.centerHorizontal,
    width: '100%',
    textAlign: 'center',
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

const FriendRequests = ({ props: { socketRef } }) => {
  const [{ auth, friendRequests }, updateState] = useContext(CTX)
  const { token } = auth
  const classes = useClasses(styles)

  const accept = (friendshipId) => {
    axios
      .put(
        '/api/user/friendships',
        { friendshipId, accept: true },
        { headers: { 'x-auth-token': token } }
      )
      .then(({ data: { newFriend } }) => {
        toast.success('Friend request accepted')
        updateState({ type: 'REMOVE_FRIEND_REQUEST', payload: { _id: friendshipId } })
        updateState({ type: 'ADD_FRIEND', payload: newFriend })
      })
      .catch(({ response }) => toast.error(response?.data?.message))
  }

  const reject = (friendId, friendshipId) => {
    axios
      .delete(`/api/user/friendships/${friendId}`, { headers: { 'x-auth-token': token } })
      .then(() => {
        updateState({ type: 'REMOVE_FRIEND_REQUEST', payload: { _id: friendshipId } })
        toast.success('Friend request rejected')
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
