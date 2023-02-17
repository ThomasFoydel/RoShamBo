import axios from 'axios'
import { toast } from 'react-toastify'
import { Link, useParams } from 'react-router-dom'
import React, { useState, useEffect, useContext } from 'react'
import { Avatar, Card, Typography, Button } from '@mui/material'
import { PersonAdd, PersonRemove, SportsKabaddi } from '@mui/icons-material'
import loadingblue from 'assets/images/loadingblue.gif'
import useClasses from 'customHooks/useClasses'
import rps from 'assets/images/rps.jpeg'
import { CTX } from 'context/Store'

const styles = (theme) => ({
  profilePage: {
    padding: '5rem 0',
    positon: 'relative',
  },
  avatarContainer: {
    width: '15rem',
    height: '15rem',
    position: 'absolute !important',
    transform: 'translateY(-15.5rem)',
    [theme.breakpoints.down('sm')]: {
      width: '12rem',
      height: '12rem',
      transform: 'translateY(-14rem)',
    },
  },
  exp: {
    width: '6rem',
    right: '-1rem',
    zIndex: '9999',
    bottom: '1.5rem',
    textAlign: 'center',
    borderRadius: '4px',
    position: 'absolute',
    padding: '.25rem .5rem',
  },
  profilePic: {
    left: '50%',
    zIndex: 200,
    width: '15rem',
    height: '15rem',
    fontSize: '4.8rem',
    border: '8px solid #ddd',
    transform: 'translateX(-50%)',
    position: 'absolute !important',
    backgroundColor: theme.palette.primary.light,
    transition: 'background 0.8s ease, color 0.8s ease',
    [theme.breakpoints.down('sm')]: {
      width: '12rem',
      height: '12rem',
      transform: 'translateX(-50%)',
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
    width: '90%',
    display: 'flex',
    padding: '1rem 0',
    borderRadius: '8px',
    alignItems: 'center',
    background: '#ffffff59',
    flexDirection: 'column',
    justifyContent: 'center',
    [theme.breakpoints.down('sm')]: {
      marginTop: '-2rem',
    },
  },
  username: {
    width: '100%',
    fontSize: '3.5rem',
    textAlign: 'center',
    color: theme.palette.primary.dark,
    [theme.breakpoints.down('sm')]: {
      fontSize: '2rem',
    },
  },
  email: {
    fontSize: '1.2rem',
    color: theme.palette.primary.dark,
    [theme.breakpoints.down('sm')]: {
      fontSize: '1rem',
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
  bio: {
    padding: '.5rem',
    fontSize: '1.2rem',
    marginBottom: '.5em',
    color: theme.palette.primary.dark,
    [theme.breakpoints.down('sm')]: {
      fontSize: '1rem',
    },
  },
  battleButton: {
    color: 'white',
    fontSize: '1.6rem',
    background: theme.palette.secondary.main,
    '&:hover': {
      background: theme.palette.secondary.dark,
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.2rem',
    },
    p: {
      marginLeft: '.5rem',
    },
  },
  requestButton: {
    top: '0.2rem',
    color: 'white',
    right: '0.2rem',
    width: '9.5rem',
    textAlign: 'center',
    position: 'absolute',
    background: theme.palette.primary.main,
    '&:hover': {
      background: theme.palette.primary.dark,
    },
    p: {
      marginLeft: '1rem',
    },
    [theme.breakpoints.down('sm')]: {
      top: 'unset',
      bottom: '0.2rem',
    },
  },
})

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

const Profile = () => {
  const { id } = useParams()
  const [{ user, auth, isLoggedIn }, updateState] = useContext(CTX)
  const [backgroundPosition, setBackgroundPosition] = useState(null)
  const [fetchComplete, setFetchComplete] = useState(false)
  const [friendship, setFriendship] = useState(null)
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState({})
  const [rank, setRank] = useState(null)
  const classes = useClasses(styles)

  const isCurrentUser = id === user.id
  const isFriend = user.friends && !!user.friends.find((f) => f._id === id)

  useEffect(() => {
    setBackgroundPosition(['left', 'center', 'right'][Math.floor(Math.random() * 3)])
  }, [])

  useEffect(() => {
    if (!isFriend) setFriendship(null)
  }, [isFriend])

  useEffect(() => {
    let subscribed = true
    setLoading(true)
    axios
      .get(`/api/user/profiles/${id}`, { headers: { userId: user.id } })
      .then(({ data }) => {
        const { user, friendship } = data

        setTimeout(() => {
          if (user && subscribed) {
            setUserData(user)
            setFriendship(friendship)
            setRank(getRank(user.exp))
          }
          if (subscribed) {
            setLoading(false)
            setFetchComplete(true)
          }
        }, 1200)
      })
      .catch(() => {
        if (subscribed) {
          setTimeout(() => {
            setLoading(false)
            toast.error('No user found')
          }, 1200)
        }
      })
    return () => (subscribed = false)
  }, [user.id, id])

  const requestFriend = () => {
    axios
      .post('/api/user/friendships/', { id }, { headers: { 'x-auth-token': auth.token } })
      .then(({ data: { newFriendRequest } }) => {
        setFriendship(newFriendRequest)
        toast.success('Friend request sent')
      })
      .catch(({ response }) => toast.error(response?.data?.message))
  }

  const removeFriend = () => {
    axios
      .delete(`/api/user/friendships/${id}`, { headers: { 'x-auth-token': auth.token } })
      .then(({ data: { friendId } }) => {
        setFriendship(null)
        toast.success('Friendship deleted')
        updateState({ type: 'REMOVE_FRIEND', payload: friendId })
      })
      .catch(({ response }) => toast.error(response?.data?.message))
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
        <div className={classes.avatarContainer}>
          <Avatar
            alt={userData.name || 'loading'}
            classes={{ root: classes.profilePic }}
            src={!fetchComplete ? loadingblue : `/api/images/${userData.profilePic}`}
          >
            {!userData.profilePic && userData.name && userData.name[0].toUpperCase()}
          </Avatar>
          {rank && (
            <Typography className={classes.exp} style={expStyles[rank]}>
              exp: {userData.exp}
            </Typography>
          )}
        </div>
        <div className={classes.infoSection}>
          <Typography className={classes.username}>{userData.name || 'loading'}</Typography>

          {fetchComplete && (
            <>
              {userData.displayEmail && (
                <Typography className={classes.email}>{userData.displayEmail}</Typography>
              )}
              {userData.bio && <Typography className={classes.bio}>{userData.bio}</Typography>}
              {!isCurrentUser && !friendship && isLoggedIn && (
                <Button className={classes.requestButton} onClick={requestFriend}>
                  <PersonAdd />
                  <p>Add Friend</p>
                </Button>
              )}
              {isFriend && friendship && (
                <>
                  <Link to={`/friendbattle/${friendship._id}`}>
                    <Button className={classes.battleButton}>
                      <SportsKabaddi />
                      <p>BATTLE {userData.name}</p>
                    </Button>
                  </Link>
                  <Button className={classes.requestButton} onClick={removeFriend}>
                    <PersonRemove />
                    <p>Remove</p>
                  </Button>
                </>
              )}
              {isCurrentUser && !loading && (
                <Typography className={classes.editLink} component={Link} to="/profile/edit">
                  edit profile
                </Typography>
              )}
            </>
          )}
        </div>
      </Card>
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
