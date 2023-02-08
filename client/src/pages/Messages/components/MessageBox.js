import axios from 'axios'
import React, { useState, useEffect, useRef } from 'react'
import useClasses from 'customHooks/useClasses'
import Message from './Message'

const styles = () => ({
  thread: {
    padding: '16px',
    overflow: 'auto',
    maxHeight: '60vh',
  },
})

const MessageBox = ({ props: { currentThread, token, socket, userId } }) => {
  const [thread, setThread] = useState([])
  const classes = useClasses(styles)
  const scrollRef = useRef()

  const handleNewMessage = (message) => {
    if (message.sender._id === currentThread || message.receiver === currentThread) {
      setThread((t) => [...t, message])
    }
  }

  useEffect(() => {
    if (socket) socket.off('chat-message')
    socket.on('chat-message', (message) => handleNewMessage(message))
    return () => {
      if (socket) socket.off('chat-message')
    }
  }, [currentThread])

  useEffect(() => {
    let subscribed = true
    if (!currentThread || !token) return setThread([])

    axios
      .get(`/api/message/thread/${currentThread}`, {
        headers: { 'x-auth-token': token },
      })
      .then(({ data }) => {
        if (data && Array.isArray(data) && subscribed) setThread(data)
      })
      .catch((err) => console.error(err))

    return () => (subscribed = false)
  }, [currentThread, token])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [thread, currentThread])

  return (
    <div className={classes.thread}>
      {thread.map((message) => (
        <Message key={message._id} props={{ message, userId }} />
      ))}
      <div ref={scrollRef} />
    </div>
  )
}

export default MessageBox
