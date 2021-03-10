import { createMuiTheme } from '@material-ui/core/styles';

const blue = '#0078FE';
// const blue = '#1085e6';
// const magenta = '#FF1FCE';
const magenta = '#CC0AC3';

export default createMuiTheme({
  palette: {
    common: {
      blue: `${blue}`,
      magenta: `${magenta}`,
    },
    primary: {
      main: `${blue}`,
    },
    secondary: {
      main: `${magenta}`,
    },
  },
  typography: {
    fontFamily: 'OpenDyslexic',
    tab: {
      fontFamily: 'OpenDyslexic',
      textTransform: 'none',
      fontWeight: '700',
      fontSize: '1rem',
    },
    loginLink: {
      fontSize: '1rem',
      textTransform: 'none',
      color: 'white',
    },
  },
});
