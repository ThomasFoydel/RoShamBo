import axios from 'axios'
import { Link, useParams } from 'react-router-dom'
import React, { useState, useEffect, useContext } from 'react'
import { Avatar, Card, Typography, Button } from '@mui/material'
import MessageNotification from 'components/MessageNotification/MessageNotification'
import useClasses from 'customHooks/useClasses'
import loadingblue from 'imgs/loadingblue.gif'
import { CTX } from 'context/Store'
import rps from 'imgs/rps.jpeg'

const initMessageNotification = { sender: null, content: null, senderId: null }

const styles = (theme) => ({
  profilePage: {
    padding: '5rem 0',
  },
  profilePic: {
    left: '50%',
    zIndex: 200,
    width: '15rem',
    height: '15rem',
    fontSize: '4.8rem',
    border: '4px solid #ddd',
    position: 'absolute !important',
    backgroundColor: theme.palette.primary.light,
    transform: 'translateX(-50%) translateY(-15.5rem)',
    transition: 'background 0.8s ease, color 0.8s ease',
    [theme.breakpoints.down('sm')]: {
      width: '12rem',
      height: '12rem',
      transform: 'translateX(-50%) translateY(-14rem)',
    },
  },
  background: {
    top: 0,
    left: 0,
    position: 'fixed',
    minWidth: '100vw',
    minHeight: '100vh',
    transform: 'scale(1.5)',
    bacgkroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    background: `linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.9) 60%), url(${rps})`,
  },
  card: {
    ...theme.centerHorizontal,
    width: '90vw',
    display: 'flex',
    marginTop: '8rem',
    padding: '8rem 0',
    minHeight: '25rem',
    background: '#ddd',
    overflow: 'visible',
    alignItems: 'center',
    flexDirection: 'column',
  },
  infoSection: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    [theme.breakpoints.down('sm')]: {
      marginTop: '-2rem',
    },
  },
  username: {
    width: '100%',
    fontSize: '3rem',
    textAlign: 'center',
    [theme.breakpoints.down('sm')]: {
      fontSize: '2rem',
    },
  },
  editLink: {
    minWidth: '100%',
    marginTop: '.5em',
    textAlign: 'center',
    color: theme.palette.primary.main,
    '&:hover': {
      color: theme.palette.primary.dark,
    },
  },
  email: {},
  bio: {
    marginBottom: '.5em',
  },
  requestButton: {
    color: 'white',
    background: theme.palette.primary.main,
    '&:hover': {
      background: theme.palette.primary.dark,
    },
  },
  exp: {
    borderRadius: '4px',
    padding: '.25rem .5rem',
  },
})

const Profile = ({ props: { socketRef } }) => {
  const { id } = useParams()
  const [{ user, auth, isLoggedIn }] = useContext(CTX)
  const [messageNotification, setMessageNotification] = useState(initMessageNotification)
  const [backgroundPosition, setBackgroundPosition] = useState(null)
  const [friendshipExists, setFriendshipExists] = useState(true)
  const [userInput, setUserInput] = useState({})
  const [loading, setLoading] = useState(false)
  const [rank, setRank] = useState(null)
  const [err, setErr] = useState('')
  const classes = useClasses(styles)

  const isCurrentUser = id === user.id

  useEffect(() => {
    setBackgroundPosition(['left', 'center', 'right'][Math.floor(Math.random() * 3)])
  }, [])

  useEffect(() => {
    let subscribed = true
    setLoading(true)
    axios
      .get(`/api/user/profile/${id}`, { headers: { userId: user.id } })
      .then(({ data: { user, friendshipExists } }) => {
        if (subscribed) {
          setTimeout(() => {
            setLoading(false)
            setUserInput(user)
            setRank(getRank(user.exp))
            setFriendshipExists(friendshipExists)
          }, 1200)
        }
      })
      .catch(() => {
        if (subscribed) {
          setTimeout(() => {
            setLoading(false)
            setErr('No user found')
          }, 1200)
        }
      })
    return () => (subscribed = false)
  }, [user.id, id])

  useEffect(() => {
    let subscribed = true
    if (socketRef && socketRef.current) {
      socketRef.current.on('chat-message-notification', (message) => {
        if (subscribed) {
          setMessageNotification({
            content: message.content,
            sender: message.sender.name,
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
      .post('/api/user/friendrequest/', { id }, { headers: { 'x-auth-token': auth.token } })
      .then(() => setFriendshipExists(true))
      .catch(() => setErr('Something went wrong, friend request not created'))
  }

  const closeMessageNotification = () => setMessageNotification(initMessageNotification)

  const expStyles = {
    white: {
      color: 'black',
      backgroundColor: 'white',
    },
    blue: {
      color: 'white',
      backgroundColor: 'blue',
    },
    purple: {
      color: 'white',
      backgroundColor: 'blue',
    },
    brown: {
      color: 'white',
      backgroundColor: 'brown',
    },
    black: {
      color: 'white',
      backgroundColor: 'black',
    },
  }

  return (
    <div className={classes.profilePage}>
      {backgroundPosition && (
        <div
          className={classes.background}
          style={{ backgroundPosition: `${backgroundPosition} center` }}
        />
      )}
      <Card className={`${classes.card} `}>
        <Avatar
          alt={userInput.name || 'loading'}
          classes={{ root: classes.profilePic }}
          src={loading || !userInput.name ? loadingblue : `/api/image/${userInput.profilePic}`}
        >
          {!userInput.profilePic && userInput.name && userInput.name[0].toUpperCase()}
        </Avatar>
        <div className={classes.infoSection}>
          <Typography className={classes.username}>{userInput.name || 'loading'}</Typography>

          {userInput.displayEmail && (
            <Typography className={classes.email}>{userInput.displayEmail}</Typography>
          )}
          {userInput.bio && <Typography className={classes.bio}>{userInput.bio}</Typography>}
          {rank && (
            <Typography className={classes.exp} style={expStyles[rank]}>
              exp: {userInput.exp}
            </Typography>
          )}
          {!isCurrentUser && !friendshipExists && isLoggedIn && (
            <Button className={classes.requestButton} onClick={requestFriend}>
              request friendship
            </Button>
          )}
          {isCurrentUser && !loading && (
            <Typography className={classes.editLink} component={Link} to="/profile/edit">
              edit profile
            </Typography>
          )}
        </div>
      </Card>
      <MessageNotification
        props={{
          severity: 'info',
          message: messageNotification,
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
