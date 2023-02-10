import { Link } from 'react-router-dom'
import { Grid, Typography } from '@mui/material'
import { People, Casino, Computer } from '@mui/icons-material'
import useClasses from 'customHooks/useClasses'

const styles = (theme) => ({
  battlePage: {
    ...theme.centerHorizontal,
    background: 'linear-gradient(#ccc, #ddd)',
    width: '90%',
    padding: '2.5rem',
    marginTop: '5rem',
    borderRadius: '4px',
  },
  link: {
    padding: '1em',
    borderRadius: '4px',
    transition: 'all 0.3s ease',
    boxShadow: 'inset 4px 4px 30px #00000025, 5px 5px 30px #00000000',
    '&:hover': {
      boxShadow: 'inset -5px -5px 30px #00000015, 5px 5px 30px #00000040',
      p: {
        color: theme.palette.primary.main,
      },
      svg: {
        color: theme.palette.primary.main,
      },
    },
  },
  text: {
    fontSize: '2rem',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    color: theme.palette.primary.dark,
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.4rem',
    },
  },
  icon: {
    width: '100%',
    height: '100%',
    transition: 'all 0.3s ease',
    color: theme.palette.primary.dark,
  },
})

const options = [
  { link: 'friends', text: 'Friends', icon: People },
  { link: 'computer', text: 'Computer', icon: Computer },
  { link: 'random', text: 'Random User', icon: Casino },
]

const Battle = () => {
  const classes = useClasses(styles)

  return (
    <Grid
      container
      gap="1.5em"
      direction="row"
      justifyContent="center"
      className={classes.battlePage}
    >
      {options.map(({ link, icon: Icon, text }) => (
        <Grid key={link} item>
          <Grid
            container
            component={Link}
            direction="column"
            alignItems="center"
            to={`/battle/${link}`}
            className={classes.link}
          >
            <Icon className={classes.icon} />
            <Typography className={classes.text}>{text}</Typography>
          </Grid>
        </Grid>
      ))}
    </Grid>
  )
}

export default Battle
