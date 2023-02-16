import { Link } from 'react-router-dom'
import { Stack, Avatar, Typography } from '@mui/material'
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
    p: {
      marginLeft: '.5rem',
    },
  },
  mineAuthorSection: {
    justifyContent: 'flex-start',
    flexDirection: 'row-reverse',
    p: {
      marginLeft: '0',
      marginRight: '.5rem',
    },
  },
  profileLink: {
    color: 'white',
    transition: 'all 0.2s ease',
    img: {
      transition: 'all 0.2s ease',
    },
    '&:hover': {
      color: theme.palette.secondary.light,
      img: {
        opacity: '0.8',
      },
    },
  },
  senderProfilePic: {
    background: theme.palette.primary.light,
  },
  messageContent: {
    padding: '1em',
    borderRadius: '12px',
    overflowWrap: 'break-word',
    background: 'rgba(255,255,255,0.2)',
  },
  senderName: {
    textAlign: 'center',
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  noBackground: {
    background: 'none !important',
  },
})

const Message = ({ props: { message, userId } }) => {
  const mine = message.sender._id === userId
  const classes = useClasses(styles)

  return (
    <Stack className={`${classes.message} ${mine && classes.mine}`}>
      <div>
        <Link to={`/profile/${message.sender._id}`} className={classes.profileLink}>
          <Stack
            direction="row"
            alignItems="center"
            className={`${classes.authorSection} ${mine && classes.mineAuthorSection}`}
          >
            <Avatar
              sx={{ color: 'inherit' }}
              className={`${classes.senderProfilePic} ${
                message.sender.profilePic && classes.noBackground
              }`}
              src={`/api/images/${message.sender.profilePic}`}
            >
              {message.sender.name &&
                !message.sender.profilePic &&
                message.sender.name[0].toUpperCase()}
            </Avatar>
            <Typography className={classes.senderName}>{message.sender.name}</Typography>
          </Stack>
        </Link>
      </div>
      <div>
        <Typography className={classes.messageContent}>{message.content}</Typography>
      </div>
    </Stack>
  )
}

export default Message
