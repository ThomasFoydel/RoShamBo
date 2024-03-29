import { Email } from '@mui/icons-material'
import React, { useContext, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { CTX } from 'context/Store'
import useClasses from 'customHooks/useClasses'

const styles = (theme) => ({
  link: {
    width: '100%',
    display: 'block',
    color: theme.palette.primary.main,
    '&:hover': {
      color: theme.palette.primary.light,
    },
  },
  top: {
    display: 'flex',
    alignItems: 'center',
    gap: '.4rem',
  },
})

const MessageNotifications = ({ socketRef, socketLoaded }) => {
  const [, updateState] = useContext(CTX)
  const { pathname } = useLocation()
  const classes = useClasses(styles)

  useEffect(() => {
    if (!socketLoaded) return
    let subscribed = true
    const socket = socketRef?.current
    if (socket) {
      socket.on('chat-message-notification', (message) => {
        if (subscribed && !pathname.startsWith('/messages')) {
          toast.info(
            <div>
              <Link
                to="/messages"
                className={classes.link}
                onClick={() => updateState({ type: 'CURRENT_THREAD', payload: message.sender._id })}
              >
                <div className={classes.top}>
                  <Email />
                  {message.sender.name}:{' '}
                </div>
                {message.content.length < 30
                  ? message.content
                  : message.content.slice(0, 30) + '...'}
              </Link>
            </div>,
            { icon: false }
          )
        }
      })
    }

    return () => {
      subscribed = false
      if (socket) socket.off('chat-message-notification')
    }
  }, [socketLoaded, socketRef, pathname])

  return <></>
}

export default MessageNotifications
