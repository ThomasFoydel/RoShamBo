import React, { useState, useEffect, useContext, useRef } from 'react';
import io from 'socket.io-client';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import axios from 'axios';
import { ThemeProvider } from '@material-ui/styles';
import theme from 'theme/Theme';
import NavBar from 'components/NavBar/NavBar';
import { CTX } from 'context/Store';
import './global.css';
import Auth from 'components/Auth/Auth';
import Profile from 'pages/Profile/Profile';
import Battle from 'pages/Battle/Battle';
import ComputerBattle from 'pages/Battle/ComputerBattle';
import BattleFriends from 'pages/Battle/BattleFriends';
import FriendBattle from 'pages/Battle/FriendBattle';
import RandomBattle from 'pages/Battle/RandomBattle';
import Forum from 'pages/Forum/Forum';
import Landing from 'pages/Landing/Landing';
import Home from 'pages/Home/Home';
import EditProfile from 'pages/EditProfile/EditProfile';
import Messages from 'pages/Messages/Messages';
import HowTo from 'pages/HowTo/HowTo';
import { makeStyles } from '@material-ui/core';
const useStyles = makeStyles(() => ({
  app: {
    minHeight: '100vh',
    background: '#111',
    color: 'white',
    fontFamily: 'OpenDyslexic',
  },
}));
const App = () => {
  const [appState, updateState] = useContext(CTX);
  const [socketLoaded, setSocketLoaded] = useState(false);

  let {
    isLoggedIn,
    auth: { token },
  } = appState;
  let socketRef = useRef(null);
  const classes = useStyles();

  useEffect(() => {
    let subscribed = true;
    let rsbToken = localStorage.getItem('roshambo-token');
    let checkAuth = async () => {
      axios
        .get('/api/auth/', {
          headers: { 'x-auth-token': rsbToken },
        })
        .then(({ data }) => {
          if (subscribed) {
            if (data.err && process.env.NODE_ENV === 'production')
              return updateState({ type: 'LOGOUT' });
            if (data) {
              updateState({
                type: 'LOGIN',
                payload: { user: data.user, token: data.token },
              });
            }
          }
        })
        .catch(() => {
          if (process.env.NODE_ENV === 'production')
            updateState({ type: 'LOGOUT' });
        });
    };

    let noToken = !rsbToken || rsbToken === 'undefined';

    noToken ? updateState({ type: 'LOGOUT' }) : checkAuth();

    return () => {
      if (socketRef.current)
        socketRef.current.emit('disconnect-room', socketRef.current.id);
      subscribed = false;
    };
  }, [updateState]);

  useEffect(() => {
    let subscribed = true;
    if (token) {
      const urlBase =
        process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000/';
      const ENDPOINT = urlBase + `?token=${token}`;

      socketRef.current = io(ENDPOINT, {
        transports: ['websocket', 'polling', 'flashsocket'],
      });

      setSocketLoaded(true);
    }

    return () => {
      subscribed = false;
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.off();
      }
    };
  }, [token, updateState]);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <div className={classes.app}>
          <NavBar />
          <Switch>
            <Route
              path='/'
              exact
              component={() =>
                isLoggedIn && socketLoaded ? (
                  <Home props={{ socketRef }} />
                ) : (
                  <Landing />
                )
              }
            />
            <Route
              path='/profile/:id'
              exact
              component={({ match }) =>
                !isLoggedIn || socketLoaded ? (
                  <Profile props={{ socketRef, match }} />
                ) : null
              }
            />
            <Route
              path='/battle'
              exact
              component={isLoggedIn ? Battle : Landing}
            />
            <Route path='/battle/computer' exact component={ComputerBattle} />
            <Route
              path='/editprofile'
              exact
              component={() =>
                isLoggedIn && socketLoaded ? (
                  <EditProfile props={{ socketRef }} />
                ) : (
                  <Landing />
                )
              }
            />
            <Route
              path='/messages'
              component={() =>
                isLoggedIn && socketLoaded ? (
                  <Messages props={{ socketRef }} />
                ) : (
                  <Landing />
                )
              }
            />
            <Route
              path='/battle/random'
              component={() =>
                isLoggedIn && socketLoaded ? (
                  <RandomBattle props={{ socketRef }} />
                ) : (
                  <Landing />
                )
              }
            />
            <Route
              path='/battle/friends'
              component={() =>
                isLoggedIn ? (
                  <BattleFriends props={{ socketRef }} />
                ) : (
                  <Landing />
                )
              }
            />
            <Route
              path='/friendbattle/:friendshipId'
              component={({ match }) =>
                socketLoaded && token && isLoggedIn ? (
                  <FriendBattle props={{ match, socketRef }} />
                ) : (
                  <Landing />
                )
              }
            />
            <Route exact path='/howto' component={HowTo} />
            <Route
              path='/forum'
              exact
              component={() =>
                socketLoaded || !isLoggedIn ? (
                  <Forum props={{ socketRef }} />
                ) : null
              }
            />
          </Switch>
          <Auth />
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
