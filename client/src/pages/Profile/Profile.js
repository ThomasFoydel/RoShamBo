import React, { useState, useEffect, useContext } from 'react'
import axios from 'axios'
import { CTX } from 'context/Store'
import { Link, useParams } from 'react-router-dom'
import { Avatar, Card, Typography, Button } from '@mui/material'
import MessageNotification from 'components/MessageNotification/MessageNotification'
import rps from 'imgs/rps.jpeg'
import loadingblue from 'imgs/loadingblue.gif'
import useClasses from 'customHooks/useClasses'
const initMessageNotification = { sender: null, content: null, senderId: null }

const styles = (theme) => ({
  profilePage: { padding: '5rem 0' },
  profilePic: {
    width: '15rem',
    height: '15rem',
    fontSize: '4.8rem',
    backgroundColor: theme.palette.primary.light,
    zIndex: 200,
    position: 'absolute !important',
    left: '50%',
    transition: 'all 0.8s ease',
    transform: 'translateX(-50%) translateY(-15.5rem)',
    [theme.breakpoints.down('sm')]: {
      width: '12rem',
      height: '12rem',
    },
  },
  background: {
    background: `linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.9) 60%), url(${rps})`,
    bacgkroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    top: 0,
    left: 0,
    minWidth: '100vw',
    minHeight: '100vh',
    position: 'fixed',
  },
  card: {
    ...theme.centerHorizontal,
    background: '#ddd',
    overflow: 'visible',
    display: 'flex',
    flexDirection: 'column',
    padding: '8rem 0',
    alignItems: 'center',
    width: '90vw',
    marginTop: '8rem',
    minHeight: '25rem',
  },
  infoSection: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  username: {
    textAlign: 'center',
    width: '100%',
    fontSize: '3rem',
    [theme.breakpoints.down('sm')]: {
      fontSize: '2rem',
    },
  },
  editLink: { textAlign: 'center', minWidth: '100%' },
  email: {},
  requestButton: {
    color: 'white',
    background: theme.palette.primary.main,
    '&:hover': {
      background: theme.palette.primary.dark,
    },
  },
  exp: {
    padding: '.25rem .5rem',
    borderRadius: '4px',
  },
})

const Profile = ({ props: { socketRef } }) => {
  const [appState] = useContext(CTX)
  const { id } = useParams()
  const isCurrentUser = id === appState.user.id
  const { isLoggedIn } = appState
  const [user, setUser] = useState({})
  const [rank, setRank] = useState(null)
  const [friendshipExists, setFriendshipExists] = useState(true)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const classes = useClasses(styles)
  const [messageNotification, setMessageNotification] = useState(initMessageNotification)
  useEffect(() => {
    let subscribed = true
    setLoading(true)
    axios
      .get(`/api/user/profile/${id}`, { headers: { userId: appState.user.id } })
      .then(({ data: { user, friendshipExists } }) => {
        if (subscribed) {
          setTimeout(() => {
            setUser(user)
            setFriendshipExists(friendshipExists)
            setLoading(false)
            setRank(getRank(user.exp))
          }, 1200)
        }
      })
      .catch(() => {
        if (subscribed) {
          setTimeout(() => {
            setErr('No user found')
            setLoading(false)
          }, 1200)
        }
      })
    return () => (subscribed = false)
  }, [appState.user.id, id])

  useEffect(() => {
    let subscribed = true
    if (socketRef && socketRef.current) {
      socketRef.current.on('chat-message-notification', (message) => {
        if (subscribed) {
          setMessageNotification({
            sender: message.sender.name,
            content: message.content,
            senderId: message.sender._id,
          })
        }
      })
    }
    return () => {
      subscribed = false
      if (socketRef && socketRef.current) {
        setMessageNotification(initMessageNotification)
        socketRef.current.off('chat-message-notification')
      }
    }
  }, [])

  const requestFriend = () => {
    axios
      .post(
        '/api/user/friendrequest/',
        { id },
        { headers: { 'x-auth-token': appState.auth.token } }
      )
      .then(() => setFriendshipExists(true))
      .catch(() => {
        setErr('Something went wrong, friend request not created')
      })
  }

  const [backgroundPosition, setBackgroundPosition] = useState(null)
  useEffect(() => {
    setBackgroundPosition(['left', 'center', 'right'][Math.floor(Math.random() * 3)])
  }, [])

  const closeMessageNotification = () => setMessageNotification(initMessageNotification)

  const expStyles = {
    white: {
      backgroundColor: 'white',
      color: 'black',
    },
    blue: {
      backgroundColor: 'blue',
      color: 'white',
    },
    purple: {
      backgroundColor: 'blue',
      color: 'white',
    },
    brown: {
      backgroundColor: 'brown',
      color: 'white',
    },
    black: {
      backgroundColor: 'black',
      color: 'white',
    },
  }

  return (
    <div className={classes.profilePage}>
      {backgroundPosition && (
        <div
          className={classes.background}
          style={{ backgroundPosition: `${backgroundPosition} bottom` }}
        ></div>
      )}
      <Card className={`${classes.card} `}>
        <Avatar
          classes={{ root: classes.profilePic }}
          alt={user.name || 'loading'}
          src={loading || !user.name ? loadingblue : `/api/image/${user.profilePic}`}
        >
          {!user.profilePic && user.name && user.name[0].toUpperCase()}
        </Avatar>
        <div className={classes.infoSection}>
          <Typography className={classes.username}>{user.name || 'loading'}</Typography>

          {user.displayEmail && (
            <Typography className={classes.email}>{user.displayEmail}</Typography>
          )}
          {user.bio && <Typography className={classes.email}>{user.bio}</Typography>}
          {rank && (
            <Typography className={classes.exp} style={expStyles[rank]}>
              exp: {user.exp}
            </Typography>
          )}
          {!isCurrentUser && !friendshipExists && isLoggedIn && (
            <Button className={classes.requestButton} onClick={requestFriend}>
              request friendship
            </Button>
          )}
          {isCurrentUser && !loading && (
            <Typography className={classes.editLink} component={Link} to="/editprofile">
              edit profile
            </Typography>
          )}
        </div>
      </Card>
      <MessageNotification
        props={{
          message: messageNotification,
          severity: 'info',
          close: closeMessageNotification,
        }}
      />
    </div>
  )
}

const getRank = (exp) => {
  switch (true) {
    case exp < 15:
      return 'white'
    case exp < 100:
      return 'blue'
    case exp < 500:
      return 'purple'
    case exp < 1000:
      return 'brown'
    case exp < 5000:
      return 'black'
    default:
      return 'white'
  }
}

export default Profile
