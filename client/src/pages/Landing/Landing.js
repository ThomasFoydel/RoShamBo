import React, { useContext } from 'react'
import { Typography, Button } from '@mui/material'
import weaponSystem from 'imgs/weaponsystem.png'
import useClasses from 'customHooks/useClasses'
import { CTX } from 'context/Store'

const styles = (theme) => ({
  container: {
    background: 'white',
  },
  title: {
    fontSize: '6rem',
    marginLeft: '1rem',
    textAlign: 'center',
    letterSpacing: '1rem',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundImage: `linear-gradient(to bottom right, ${theme.palette.secondary.light}, ${theme.palette.primary.main})`,
    [theme.breakpoints.down('sm')]: {
      fontSize: '3.5rem',
      marginLeft: '.3rem',
      letterSpacing: '.3rem',
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '2.5rem',
      marginLeft: '.2rem',
      letterSpacing: '.2rem',
    },
  },
  weaponSystem: {
    padding: '5%',
    width: '100%',
    borderBottom: 'none',
    border: '8px solid black',
    background: `radial-gradient(${theme.palette.secondary.dark}, ${theme.palette.primary.main})`,
  },
  startBtn: {
    top: '50vh',
    left: '50%',
    color: '#ddd',
    fontSize: '5rem',
    position: 'fixed',
    whiteSpace: 'nowrap',
    padding: '.5rem 2.5rem',
    backdropFilter: 'blur(2px)',
    transition: 'all 0.45s ease',
    background: theme.palette.secondary.main,
    transform: 'translateX(-50%) translateY(-50%)',
    boxShadow: '.5rem .5rem 1rem rgba(0,0,0,0.2), -.5rem -.5rem 1.5rem rgba(255,255,255,0.15)',
    '&:hover': {
      color: '#fff',
      background: 'rgba(255,255,255,0.15)',
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '2rem',
      padding: '.2rem 1rem',
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.4rem',
      padding: '.2rem 1rem',
    },
  },
})

const Landing = () => {
  const [, updateState] = useContext(CTX)

  const classes = useClasses(styles)

  const openModal = () => updateState({ type: 'AUTH_MODAL', payload: true })

  return (
    <>
      <div style={{ position: 'relative' }}>
        <img
          src={weaponSystem}
          className={classes.weaponSystem}
          alt="weapons system: scissors beats bird and paper. paper beats tree and rock. rock beats bird and scissors. tree beats rock and scissors. "
        />
        <Button onClick={openModal} className={classes.startBtn}>
          Get Started
        </Button>
      </div>
      <div className={classes.container}>
        <Typography className={classes.title}>ROSHAMBO</Typography>
      </div>
    </>
  )
}

export default Landing
