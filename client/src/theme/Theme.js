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

  healthbarContainer: {
    width: '90%',
    background: '#db3030',
    marginLeft: '50%',
    transform: 'translateX(-50%)',
    position: 'relative',
  },
  healthbar: {
    background: '#1a9c17',
    height: '4rem',
    transition: 'all 0.5s ease',
  },
});
