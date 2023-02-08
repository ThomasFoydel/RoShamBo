import React, { useEffect, useState } from 'react'
import MessageNotification from 'components/MessageNotification/MessageNotification'
import FriendRequests from 'components/FriendRequests/FriendRequests'
import useClasses from 'customHooks/useClasses'
import hands from 'imgs/hands.gif'

const styles = (theme) => ({
  hands: {
    ...theme.centerHorizontal,
    bottom: '0',
    opacity: '0.7',
    width: '100vw',
    position: 'absolute',
  },
})

const msgInitState = { sender: null, content: null, senderId: null }

const Home = ({ props: { socketRef } }) => {
  const classes = useClasses(styles)
  const [messageNotification, setMessageNotification] = useState(msgInitState)

  useEffect(() => {
    let subscribed = true
    socketRef.current.on('chat-message-notification', (message) => {
      if (subscribed) {
        setMessageNotification({
          content: message.content,
          sender: message.sender.name,
          senderId: message.sender._id,
        })
      }
    })
    return () => {
      subscribed = false
      setMessageNotification(msgInitState)
      socketRef.current.off('chat-message-notification')
    }
  }, [])

  const closeMessageNotification = () => setMessageNotification(msgInitState)

  return (
    <div className={classes.home}>
      <img src={hands} className={classes.hands} alt="two hands throwing scissors and paper" />
      <FriendRequests />
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

export default Home
