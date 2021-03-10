import React from 'react';
import Game from 'components/Game/Game';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import NavBar from 'components/NavBar/NavBar';

import { ThemeProvider } from '@material-ui/styles';
import theme from 'theme/Theme';
import './global.css';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <NavBar />
        <Switch>
          <Route path='/game' exact component={Game} />
        </Switch>
      </Router>
    </ThemeProvider>
  );
};
export default App;
