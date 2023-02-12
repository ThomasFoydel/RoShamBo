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
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.2rem',
    },
  },
  link: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: theme.palette.secondary.main,
    '&:hover': {
      color: theme.palette.secondary.light,
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '1rem',
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
  const [friendlist, setFriendlist] = useState([])
  const [{ auth, user }] = useContext(CTX)
  const classes = useClasses(styles)
  const { token } = auth
  const { id } = user

  useEffect(() => {
    if (!token) return
    axios
      .get('/api/user/friendships', { headers: { 'x-auth-token': token } })
      .then(({ data: { friendList } }) => setFriendlist(friendList))
      .catch(({ response }) => toast.error(response?.data?.message))
  }, [token])

  return (
    <Grid container justify="center" className={classes.battleFriends}>
      {friendlist.length === 0 && (
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
    <Grid container alignItems="center" justify="center" className={classes.friend}>
      <Grid
        item
        component={Avatar}
        className={classes.friendPic}
        src={`/api/images/${friend.profilePic}`}
      />
      <Grid className={classes.friendName}>{friend.name}</Grid>
      <Grid item className={classes.link} component={Link} to={`/friendbattle/${_id}`}>
        connect for battle
      </Grid>
    </Grid>
  )
}

export default BattleFriends
