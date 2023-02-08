import { Link } from 'react-router-dom'
import { Grid, Avatar, Typography } from '@mui/material'
import useClasses from 'customHooks/useClasses'

const styles = (theme) => ({
  message: {
    padding: '.5em',
    margin: '.5em 0',
    background: '#111',
    borderRadius: '18px 18px 18px 2px',
  },
  mine: {
    borderRadius: '18px 18px 2px 18px',
    background: theme.palette.primary.dark,
  },
  authorSection: {
    padding: '.25em .75em',
  },
  mineAuthorSection: {
    justifyContent: 'flex-end',
  },
  senderProfilePic: {
    marginRight: '.5em',
    background: theme.palette.primary.light,
  },
  messageContent: {
    padding: '1em',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.2)',
  },
  senderName: {
    textAlign: 'center',
  },
})

const Message = ({ props: { message, userId } }) => {
  const mine = message.sender._id === userId
  const classes = useClasses(styles)

  return (
    <Grid className={`${classes.message} ${mine && classes.mine}`} container direction="column">
      <Grid item>
        <Grid
          container
          alignItems="center"
          className={`${classes.authorSection} ${mine && classes.mineAuthorSection}`}
        >
          <Link to={`/profile/${message.sender._id}`}>
            <Avatar
              className={classes.senderProfilePic}
              src={`/api/image/${message.sender.profilePic}`}
            >
              {message.sender.name &&
                !message.sender.profilePic &&
                message.sender.name[0].toUpperCase()}
            </Avatar>
          </Link>
          <Typography className={classes.senderName}>{message.sender.name}</Typography>
        </Grid>
      </Grid>
      <Grid item>
        <Typography className={classes.messageContent}>{message.content}</Typography>
      </Grid>
    </Grid>
  )
}

export default Message
