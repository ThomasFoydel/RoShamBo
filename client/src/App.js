import React, { useEffect, useContext, useRef } from 'react';
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

const App = () => {
  const [appState, updateState] = useContext(CTX);
  let {
    auth: { token },
  } = appState;
  let socketRef = useRef(null);

  useEffect(() => {
    let subscribed = true;
    let rsbToken = localStorage.getItem('roshambo-token');
    console.log({ rsbToken });
    let checkAuth = async () => {
      axios
        .get('/api/auth/', {
          headers: { 'x-auth-token': rsbToken },
        })
        .then(({ data }) => {
          console.log({ data });
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
        .catch((err) => {
          console.log({ err });
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
          <Route path='/game' exact component={Game} />
        </Switch>
        <Auth />
      </Router>
    </ThemeProvider>
  );
};
export default App;
