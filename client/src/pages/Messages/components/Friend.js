import { Avatar, Grid, Typography } from '@mui/material'
import useClasses from 'customHooks/useClasses'

const styles = (theme) => ({
  friend: {
    padding: '.3em',
    background: '#111',
    borderRadius: '4px',
    '&:hover': {
      cursor: 'pointer',
    },
  },
  friendProfilePic: {
    marginRight: '.5em',
    background: theme.palette.primary.dark,
  },
  friendName: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
})

const Friend = ({ props: { friend, handleSelectFriend } }) => {
  const classes = useClasses(styles)

  return (
    <Grid
      container
      wrap="nowrap"
      alignItems="center"
      className={classes.friend}
      onClick={() => handleSelectFriend(friend._id)}
    >
      <Avatar className={classes.friendProfilePic} src={`/api/images/${friend.profilePic}`}>
        {!friend.profilePic && friend.name && friend.name[0].toUpperCase()}
      </Avatar>
      <Typography className={classes.friendName}>{friend.name}</Typography>
    </Grid>
  )
}

export default Friend
