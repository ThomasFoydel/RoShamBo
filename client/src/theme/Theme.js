import { createTheme } from '@mui/material/styles'

const blue = '#0078FE'
// const magenta = '#CC0AC3';
const magenta = '#cc0a6d'

export default createTheme({
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
    fontFamily: 'OpenDyslexic, sans-serif',
    tab: {
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
    background: '#db3030',
    position: 'relative',
  },
  healthbar: {
    background: '#1a9c17',
    height: '4rem',
    transition: 'all 0.5s ease',
  },
  centerHorizontal: {
    marginLeft: '50%',
    transform: 'translateX(-50%)',
  },
})
