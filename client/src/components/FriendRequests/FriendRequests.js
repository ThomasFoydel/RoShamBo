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
  friendRequest: {
    ...theme.centerHorizontal,
    width: '20rem',
    padding: '1rem',
    display: 'flex',
    marginTop: '.5rem',
    borderRadius: '4px',
    alignItems: 'center',
    marginBottom: '.5rem',
    justifyContent: 'center',
    border: `1px solid ${theme.palette.primary.main}`,
  },
  name: {
    fontSize: '1.4rem',
    marginRight: '.5rem',
  },
  btn: {
    color: 'white',
    margin: '0 .5rem',
    background: theme.palette.primary.main,
    '&:hover': {
      background: theme.palette.primary.dark,
    },
  },
})

const FriendRequests = () => {
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
        <FriendRequest key={request._id} props={{ request, reject, accept, classes }} />
      ))}
    </div>
  )
}

export default FriendRequests
