import axios from 'axios'
import io from 'socket.io-client'
import 'react-toastify/dist/ReactToastify.css'
import { ThemeProvider } from '@emotion/react'
import { toast, ToastContainer } from 'react-toastify'
import { Routes, Route } from 'react-router-dom'
import { StyledEngineProvider } from '@mui/material/styles'
import React, { useState, useEffect, useContext, useRef } from 'react'
import MessageNotifications from 'components/MessageNotifications/MessageNotifications'
import ComputerBattle from 'pages/Battle/ComputerBattle'
import EditProfile from 'pages/EditProfile/EditProfile'
import BattleFriends from 'pages/Battle/BattleFriends'
import FriendBattle from 'pages/Battle/FriendBattle'
import RandomBattle from 'pages/Battle/RandomBattle'
import Messages from 'pages/Messages/Messages'
import NavBar from 'components/NavBar/NavBar'
import Landing from 'pages/Landing/Landing'
import Profile from 'pages/Profile/Profile'
import Battle from 'pages/Battle/Battle'
import Auth from 'components/Auth/Auth'
import Forum from 'pages/Forum/Forum'
import HowTo from 'pages/HowTo/HowTo'
import { CTX } from 'context/Store'
import { isDev } from 'utils/utils'
import Home from 'pages/Home/Home'
import theme from 'theme/Theme'
import './global.css'

const App = () => {
  const [{ isLoggedIn, auth }, updateState] = useContext(CTX)
  const { token } = auth

  const [authFetchComplete, setAuthFetchComplete] = useState(false)
  const [socketLoaded, setSocketLoaded] = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {
    let subscribed = true
    const remember = localStorage.getItem('remember')
    const rsbToken = localStorage.getItem('roshambo-token')
    const noToken = !rsbToken || rsbToken === 'undefined'
    if (noToken || remember === 'false') {
      setAuthFetchComplete(true)
      return updateState({ type: 'LOGOUT' })
    }

    const fetchAuth = async () => {
      try {
        const { data } = await axios.get('/api/auth/', { headers: { 'x-auth-token': rsbToken } })
        if (data?.err && !isDev() && subscribed) return updateState({ type: 'LOGOUT' })
        if (data && subscribed) {
          updateState({ type: 'LOGIN', payload: { user: data.user, token: data.token, remember } })
        }
      } catch ({ response }) {
        if (!isDev()) updateState({ type: 'LOGOUT' })
      }
      setTimeout(() => setAuthFetchComplete(true), 100)
    }
    fetchAuth()

    return () => {
      if (socketRef.current) socketRef.current.emit('disconnect-room', socketRef.current.id)
      subscribed = false
    }
  }, [updateState])

  useEffect(() => {
    if (token) {
      const urlBase = isDev() ? 'http://127.0.0.1:8000/' : ''
      const ENDPOINT = `${urlBase}?token=${token}`
      socketRef.current = io(ENDPOINT, { transports: ['websocket', 'polling', 'flashsocket'] })
      setSocketLoaded(true)
      socketRef.current.on('friendrequest-accepted', (user) => {
        toast.success(`${user.name} accepted your friend request`)
        updateState({ type: 'ADD_FRIEND', payload: user })
      })
      socketRef.current.on('friendship-deleted', (user) => {
        updateState({ type: 'REMOVE_FRIEND', payload: user._id })
      })
      socketRef.current.on('new-friendrequest', ({ user }) =>
        toast.info(`New friend request from ${user?.name}`)
      )
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners()
        socketRef.current.off('chat-message-notification')
        socketRef.current.off()
      }
    }
  }, [token, updateState])

  const loggedAndLoaded = token && isLoggedIn && socketLoaded
  const socketOrNotLoggedIn = !isLoggedIn || socketLoaded

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        {authFetchComplete && (
          <div
            style={{
              color: 'white',
              minHeight: '100vh',
              background: '#111',
              paddingBottom: '3rem',
            }}
          >
            <NavBar />
            <Routes>
              <Route
                exact
                path="/"
                element={loggedAndLoaded ? <Home props={{ socketRef }} /> : <Landing />}
              />
              <Route
                exact
                path="/profile/edit"
                element={loggedAndLoaded ? <EditProfile /> : <Landing />}
              />
              <Route
                exact
                path="/profile/:id"
                element={socketOrNotLoggedIn ? <Profile /> : <></>}
              />
              <Route exact path="/battle" element={isLoggedIn ? <Battle /> : <Landing />} />
              <Route exact path="/battle/computer" element={<ComputerBattle />} />
              <Route
                exact
                path="/messages"
                element={loggedAndLoaded ? <Messages props={{ socketRef }} /> : <Landing />}
              />
              <Route
                exact
                path="/battle/random"
                element={loggedAndLoaded ? <RandomBattle props={{ socketRef }} /> : <Landing />}
              />
              <Route
                exact
                path="/battle/friends"
                element={loggedAndLoaded ? <BattleFriends /> : <Landing />}
              />
              <Route
                exact
                path="/friendbattle/:friendshipId"
                element={loggedAndLoaded ? <FriendBattle props={{ socketRef }} /> : <Landing />}
              />
              <Route exact path="/howto" element={<HowTo />} />
              <Route exact path="/forum" element={socketOrNotLoggedIn ? <Forum /> : <></>} />
            </Routes>
            <Auth />
          </div>
        )}
        <MessageNotifications socketRef={socketRef} socketLoaded={socketLoaded} />
        <ToastContainer position="bottom-right" theme="dark" limit={5} />
      </ThemeProvider>
    </StyledEngineProvider>
  )
}

export default App
