import axios from 'axios'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import { Avatar, Typography, Grid } from '@mui/material'
import React, { useState, useEffect, useContext } from 'react'
import useClasses from 'customHooks/useClasses'
import { CTX } from 'context/Store'

const styles = (theme) => ({
  battleFriends: {
    padding: '2em',
    background: 'linear-gradient(#ccc, #ddd)',
  },
  friend: {
    padding: '1em',
    margin: '.5em',
    background: '#111',
    borderRadius: '4px',
  },
  friendName: {
    margin: '0 .5em',
    fontSize: '2rem',
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.2rem',
    },
  },
  link: {
    color: theme.palette.primary.main,
    p: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: theme.palette.secondary.main,
      [theme.breakpoints.down('sm')]: {
        fontSize: '1.2rem',
      },
    },
    '&:hover': {
      color: theme.palette.primary.light,
      p: {
        color: theme.palette.secondary.light,
      },
    },
  },
  friendPic: {
    background: theme.palette.primary.main,
  },
  noFriends: {
    width: '100%',
    padding: '2rem',
    background: 'black',
    textAlign: 'center',
    a: {
      color: theme.palette.primary.main,
      '&:hover': {
        color: theme.palette.primary.light,
      },
    },
  },
})

const BattleFriends = () => {
  const [fetchCompleted, setFetchCompleted] = useState(false)
  const [friendlist, setFriendlist] = useState([])
  const [{ auth, user }] = useContext(CTX)
  const classes = useClasses(styles)
  const { token } = auth
  const { id } = user

  useEffect(() => {
    if (!token) return
    const fetchFriends = async () => {
      try {
        const { data } = await axios.get('/api/user/friendships', {
          headers: { 'x-auth-token': token },
        })
        setFriendlist(data.friendships)
      } catch ({ response }) {
        toast.error(response?.data?.message)
      }
      setFetchCompleted(true)
    }

    fetchFriends()
  }, [token])

  return (
    <Grid container justify="center" className={classes.battleFriends}>
      {fetchCompleted && friendlist.length === 0 && (
        <div className={classes.noFriends}>
          <Typography>No friends yet...</Typography>
          <Typography>
            Go meet some new friends in the <Link to="/forum">Forum</Link>
          </Typography>
          <Typography>
            Or go battle <Link to="/battle/computer">the computer</Link>
          </Typography>
          <Typography>
            or a <Link to="/battle/random">random user</Link>
          </Typography>
        </div>
      )}
      {friendlist.map(({ _id, receiver, sender }) => (
        <Friend key={_id} props={{ friend: sender._id === id ? receiver : sender, _id }} />
      ))}
    </Grid>
  )
}

const Friend = ({ props: { friend, _id } }) => {
  const classes = useClasses(styles)
  return (
    <Link to={`/friendbattle/${_id}`} className={classes.link}>
      <Grid container alignItems="center" justify="center" className={classes.friend}>
        <Grid
          item
          component={Avatar}
          className={classes.friendPic}
          src={`/api/images/${friend.profilePic}`}
        />
        <Grid item className={classes.friendName}>
          {friend.name}
        </Grid>
        <Grid item component="p">
          connect for battle
        </Grid>
      </Grid>
    </Link>
  )
}

export default BattleFriends
