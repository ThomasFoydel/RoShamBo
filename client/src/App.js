import React, { useState, useEffect, useContext, useRef } from 'react';
import io from 'socket.io-client';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import axios from 'axios';
import { ThemeProvider } from '@material-ui/styles';
import theme from 'theme/Theme';
import NavBar from 'components/NavBar/NavBar';
import Game from 'components/Game/Game';
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

const App = () => {
  const [appState, updateState] = useContext(CTX);
  const [socketLoaded, setSocketLoaded] = useState(false);
  let {
    isLoggedIn,
    auth: { token },
  } = appState;
  let socketRef = useRef(null);

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
            if (data)
              updateState({
                type: 'LOGIN',
                payload: { user: data, token: rsbToken },
              });
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

      if (subscribed) {
        socketRef.current.on('chat-message', (message) =>
          updateState({ type: 'NEW_MESSAGE', payload: { message } })
        );
      }
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
        <NavBar />
        <Switch>
          <Route path='/' exact component={isLoggedIn ? Home : Landing} />
          <Route path='/game' exact component={Game} />
          <Route path='/profile/:id' exact component={Profile} />
          <Route path='/battle' exact component={Battle} />
          <Route path='/battle/computer' component={ComputerBattle} />
          <Route
            path='/battle/random'
            component={() =>
              socketLoaded && <RandomBattle props={{ socketRef }} />
            }
          />
          <Route path='/battle/friends' component={BattleFriends} />
          <Route
            path='/friendbattle/:friendshipId'
            component={({ match }) =>
              socketLoaded &&
              token && <FriendBattle props={{ match, socketRef }} />
            }
          />
          <Route path='/forum' exact component={Forum} />
        </Switch>
        <Auth />
      </Router>
    </ThemeProvider>
  );
};

export default App;
