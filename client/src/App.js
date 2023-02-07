import React, { useState, useEffect, useContext, useRef } from 'react'
import io from 'socket.io-client'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import axios from 'axios'
// import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { StyledEngineProvider } from '@mui/material/styles'
import { ThemeProvider } from '@emotion/react'
import theme from 'theme/Theme'
import NavBar from 'components/NavBar/NavBar'
import { CTX } from 'context/Store'
import './global.css'
import Auth from 'components/Auth/Auth'
import Profile from 'pages/Profile/Profile'
import Battle from 'pages/Battle/Battle'
import ComputerBattle from 'pages/Battle/ComputerBattle'
import BattleFriends from 'pages/Battle/BattleFriends'
import FriendBattle from 'pages/Battle/FriendBattle'
import RandomBattle from 'pages/Battle/RandomBattle'
import Forum from 'pages/Forum/Forum'
import Landing from 'pages/Landing/Landing'
import Home from 'pages/Home/Home'
import EditProfile from 'pages/EditProfile/EditProfile'
import Messages from 'pages/Messages/Messages'
import HowTo from 'pages/HowTo/HowTo'
import { isDev } from 'utils/utils'

const App = () => {
  const [appState, updateState] = useContext(CTX)
  const [socketLoaded, setSocketLoaded] = useState(false)

  let {
    isLoggedIn,
    auth: { token },
  } = appState
  let socketRef = useRef(null)

  useEffect(() => {
    let subscribed = true
    let rsbToken = localStorage.getItem('roshambo-token')
    let checkAuth = async () => {
      axios
        .get('/api/auth/', {
          headers: { 'x-auth-token': rsbToken },
        })
        .then(({ data }) => {
          if (subscribed) {
            if (data.err && !isDev()) return updateState({ type: 'LOGOUT' })
            if (data) {
              updateState({
                type: 'LOGIN',
                payload: { user: data.user, token: data.token },
              })
            }
          }
        })
        .catch(() => !isDev() && updateState({ type: 'LOGOUT' }))
    }

    let noToken = !rsbToken || rsbToken === 'undefined'

    noToken ? updateState({ type: 'LOGOUT' }) : checkAuth()

    return () => {
      if (socketRef.current) socketRef.current.emit('disconnect-room', socketRef.current.id)
      subscribed = false
    }
  }, [updateState])

  useEffect(() => {
    let subscribed = true
    if (token) {
      const urlBase = !isDev() ? '' : 'http://localhost:8000/'
      const ENDPOINT = urlBase + `?token=${token}`

      socketRef.current = io(ENDPOINT, {
        transports: ['websocket', 'polling', 'flashsocket'],
      })

      setSocketLoaded(true)
    }

    return () => {
      subscribed = false
      if (socketRef.current) {
        socketRef.current.removeAllListeners()
        socketRef.current.off()
      }
    }
  }, [token, updateState])

  return (
    <StyledEngineProvider injectFirst>
      {/* <MuiThemeProvider theme={theme}> */}
      <ThemeProvider theme={theme}>
        <Router>
          <div
            styles={{
              fontFamily: 'OpenDyslexic',
              background: '#111',
              minHeight: '100vh',
              color: 'white',
            }}
          >
            <NavBar />
            <Routes>
              <Route
                path="/"
                exact
                element={isLoggedIn && socketLoaded ? <Home props={{ socketRef }} /> : <Landing />}
              />
              <Route
                path="/profile/:id"
                exact
                element={!isLoggedIn || socketLoaded ? <Profile props={{ socketRef }} /> : <></>}
              />
              <Route path="/battle" exact element={isLoggedIn ? Battle : Landing} />
              <Route path="/battle/computer" exact element={ComputerBattle} />
              <Route
                path="/editprofile"
                exact
                element={
                  isLoggedIn && socketLoaded ? <EditProfile props={{ socketRef }} /> : <Landing />
                }
              />
              <Route
                path="/messages"
                element={
                  isLoggedIn && socketLoaded ? <Messages props={{ socketRef }} /> : <Landing />
                }
              />
              <Route
                path="/battle/random"
                element={
                  isLoggedIn && socketLoaded ? <RandomBattle props={{ socketRef }} /> : <Landing />
                }
              />
              <Route
                path="/battle/friends"
                element={isLoggedIn ? <BattleFriends props={{ socketRef }} /> : <Landing />}
              />
              <Route
                path="/friendbattle/:friendshipId"
                element={
                  socketLoaded && token && isLoggedIn ? (
                    <FriendBattle props={{ socketRef }} />
                  ) : (
                    <Landing />
                  )
                }
              />
              <Route exact path="/howto" element={HowTo} />
              <Route
                path="/forum"
                exact
                element={socketLoaded || !isLoggedIn ? <Forum props={{ socketRef }} /> : null}
              />
            </Routes>
            <Auth />
          </div>
        </Router>
      </ThemeProvider>
      {/* </MuiThemeProvider> */}
    </StyledEngineProvider>
  )
}

export default App
