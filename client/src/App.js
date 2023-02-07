import axios from 'axios'
import io from 'socket.io-client'
import { ThemeProvider } from '@emotion/react'
import { StyledEngineProvider } from '@mui/material/styles'
import React, { useState, useEffect, useContext, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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

  const [socketLoaded, setSocketLoaded] = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {
    let subscribed = true
    const rsbToken = localStorage.getItem('roshambo-token')
    const noToken = !rsbToken || rsbToken === 'undefined'
    if (noToken) return updateState({ type: 'LOGOUT' })

    axios
      .get('/api/auth/', { headers: { 'x-auth-token': rsbToken } })
      .then(({ data }) => {
        if (subscribed) {
          if (data.err && !isDev()) return updateState({ type: 'LOGOUT' })
          if (data) {
            updateState({ type: 'LOGIN', payload: { user: data.user, token: data.token } })
          }
        }
      })
      .catch(() => !isDev() && updateState({ type: 'LOGOUT' }))

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
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners()
        socketRef.current.off()
      }
    }
  }, [token, updateState])

  const loggedAndLoaded = token && isLoggedIn && socketLoaded
  const socketOrNotLoggedIn = !isLoggedIn || socketLoaded

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <Router>
          <div
            style={{
              color: 'white',
              minHeight: '100vh',
              background: '#111',
              fontFamily: 'OpenDyslexic',
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
                path="/profile/:id"
                element={socketOrNotLoggedIn ? <Profile props={{ socketRef }} /> : <></>}
              />
              <Route exact path="/battle" element={isLoggedIn ? Battle : Landing} />
              <Route exact path="/battle/computer" element={ComputerBattle} />
              <Route
                exact
                path="/editprofile"
                element={loggedAndLoaded ? <EditProfile props={{ socketRef }} /> : <Landing />}
              />
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
                element={loggedAndLoaded ? <BattleFriends props={{ socketRef }} /> : <Landing />}
              />
              <Route
                exact
                path="/friendbattle/:friendshipId"
                element={loggedAndLoaded ? <FriendBattle props={{ socketRef }} /> : <Landing />}
              />
              <Route exact path="/howto" element={HowTo} />
              <Route
                exact
                path="/forum"
                element={socketOrNotLoggedIn ? <Forum props={{ socketRef }} /> : <></>}
              />
            </Routes>
            <Auth />
          </div>
        </Router>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}

export default App
