import Webcam from 'react-webcam'
import { Grid, Stack } from '@mui/material'
import * as handpose from '@tensorflow-models/handpose'
import React, { useRef, useState, useEffect } from 'react'
import useClasses from 'customHooks/useClasses'
import weaponImgs from 'assets/images/weapons'
import weaponAudio from 'assets/audio/weapons'
import themeAudio from 'assets/audio/themes'
import robot from 'assets/images/robot.svg'
import soundFx from 'assets/audio/fx'
import { detect } from './utils'

const weapons = {
  paper: { beats: ['tree', 'rock'] },
  bird: { beats: ['paper', 'tree'] },
  rock: { beats: ['scissors', 'bird'] },
  tree: { beats: ['rock', 'scissors'] },
  scissors: { beats: ['bird', 'paper'] },
}

const styles = (theme) => ({
  gameGrid: {
    padding: '3rem',
    [theme.breakpoints.down('sm')]: {
      padding: '0',
      paddingTop: '2rem',
    },
    overflow: 'hidden',
  },
  userSection: {
    ...theme.centerHorizontal,
    width: '90%',
    maxWidth: '100%',
    padding: '2rem 0',
    minHeight: '27rem',
    position: 'relative',
    borderRadius: '1.2rem',
    background: theme.palette.common.blue,
    [theme.breakpoints.down('md')]: {
      display: 'flex',
      textAlign: 'center',
      flexDirection: 'column',
    },
    [theme.breakpoints.down('sm')]: {
      padding: '1rem 0',
      minHeight: '16rem',
      borderTopLeftRadius: '0',
      borderTopRightRadius: '0',
    },
  },
  webcamSection: {
    overflow: 'hidden',
  },
  webcam: {
    ...theme.centerHorizontal,
    display: 'block',
    maxWidth: '101%',
    minWidth: '100%',
    maxHeight: '16rem',
    minHeight: '16rem',
    objectFit: 'cover',
    textAlign: 'center',
    marginBottom: '8px',
    [theme.breakpoints.down('sm')]: {
      maxHeight: '11rem',
    },
  },
  countDown: {
    top: '50%',
    left: '50%',
    color: 'white',
    zIndex: '8000',
    fontSize: '8rem',
    fontWeight: 'bold',
    position: 'absolute',
    transform: 'translateX(-50%) translateY(-50%)',
  },
  robot: {
    width: '100%',
  },
  robotImg: {
    ...theme.centerHorizontal,
    width: '70%',
    maxHeight: '16rem',
  },
  robotSection: {
    width: '90%',
    height: '27rem',
    padding: '2rem 0',
    marginLeft: 'auto',
    marginRight: 'auto',
    background: 'purple',
    borderRadius: '1.2rem',
    [theme.breakpoints.down('md')]: {
      marginBottom: '1rem',
    },
    [theme.breakpoints.down('sm')]: {
      height: '22.5rem',
      padding: '1rem 0',
      marginBottom: '0rem',
      borderBottomLeftRadius: '0',
      borderBottomRightRadius: '0',
    },
  },
  gameDialog: {
    display: 'flex',
    padding: '1rem',
    textAlign: 'center',
    borderRadius: '1.2rem',
    flexDirection: 'column',
    backgroundColor: theme.palette.common.magenta,
    [theme.breakpoints.down('md')]: {
      height: '27rem',
    },
    [theme.breakpoints.down('sm')]: {
      ...theme.centerHorizontal,
      width: '90%',
      height: '16rem',
      padding: '1rem',
      borderRadius: '0',
    },
  },
  dialogTop: {
    height: '7rem',
    lineHeight: '1.2rem',
    [theme.breakpoints.down('sm')]: {
      height: '6rem',
    },
  },
  startBtn: {
    border: 'none',
    color: 'white',
    marginTop: '1rem',
    borderRadius: '.5rem',
    letterSpacing: '.1rem',
    padding: '.1rem 1.2rem',
    transition: 'all 0.3s ease',
    background: theme.palette.primary.dark,
    '&:hover': {
      background: 'white',
      color: theme.palette.primary.dark,
    },
    [theme.breakpoints.down('md')]: {
      fontSize: '1.5rem',
      marginTop: '1.5rem',
      padding: '.3rem 1.8rem',
    },
    [theme.breakpoints.down('md')]: {
      fontSize: '1.2rem',
      marginTop: '.8rem',
      padding: '.2rem 1.3rem',
    },
  },
  iconContainer: {
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'row',
    },
  },
  weaponIcon: {
    padding: '1em',
    minHeight: '7rem',
    maxHeight: '7rem',
    marginTop: '1rem',
    overflow: 'hidden',
    background: 'purple',
    borderRadius: '1rem',
    [theme.breakpoints.down('sm')]: {
      width: '70%',
      margin: '0 .5rem',
    },
  },
  userWeapon: {
    transform: 'scaleX(-1)',
    background: theme.palette.common.blue,
  },
  healthbarContainer: {
    ...theme.healthbarContainer,
    ...theme.centerHorizontal,
    width: '90%',
  },
  healthbar: {
    height: '4rem',
    background: '#1a9c17',
    transition: 'all 0.5s ease',
    [theme.breakpoints.down('sm')]: {
      height: '2rem',
    },
  },
  messageSection: {
    width: '100%',
    color: 'white',
    height: '12rem',
    fontSize: '1.8rem',
    textAlign: 'center',
    [theme.breakpoints.down('sm')]: {
      width: '90%',
      ...theme.centerHorizontal,
    },
  },
})

const recursiveAttempt = async (handPoseNet, webcamRef) => {
  let attempts = 0
  const recurse = async () => {
    if (attempts < 50) {
      const userChoice = await detect(handPoseNet, webcamRef)
      if (userChoice) return userChoice
      attempts++
      return recurse()
    }
    return null
  }
  return recurse()
}

function ComputerBattle() {
  const [gameRunning, setGameRunning] = useState(false)
  const [timer, setTimer] = useState(null)
  const classes = useClasses(styles)
  const webcamRef = useRef(null)

  const [message, setMessage] = useState('click the button to start')
  const [computerSelection, setComputerSelection] = useState('blank')
  const [userSelection, setUserSelection] = useState('blank')

  const music = themeAudio.battle

  const [computerHealth, setComputerHealth] = useState(100)
  const [handPoseNet, setHandPoseNet] = useState(null)
  const [userHealth, setUserHealth] = useState(100)
  const [boutNumber, setBoutNumber] = useState(0)
  const [winner, setWinner] = useState(null)

  const startGameLoop = () => {
    setComputerHealth(100)
    setUserHealth(100)
    setWinner(null)
    startBout()
  }

  const startBout = () => {
    setTimer(3)
    setGameRunning(true)
    setUserSelection('blank')
    setComputerSelection('blank')
    if (music.paused) music.play()
  }

  useEffect(() => {
    if (timer !== null) {
      if (timer > 0) {
        soundFx.count.currentTime = 0
        soundFx.count.play()
        setTimeout(() => setTimer((c) => c - 1), 1000)
      } else {
        setTimer(null)
        soundFx.shoot.currentTime = 0
        soundFx.shoot.play()
        soundFx.fight.currentTime = 0
        soundFx.fight.play()

        const runHandpose = async () => {
          const userChoice = await recursiveAttempt(handPoseNet, webcamRef)
          if (!soundFx.fight.paused) setTimeout(() => soundFx.fight.pause(), 0)
          if (!userChoice) {
            setMessage('I couldnt see what you were throwing!')
            setComputerSelection('blank')
            setUserSelection('blank')
            return setTimeout(() => setBoutNumber((b) => b + 1), 1800)
          }

          const userWeapon = weapons[userChoice]
          const randomIndex = Math.floor(Math.random() * 5)
          const weaponOptions = Object.keys(weapons)
          const computerChoice = weaponOptions[randomIndex]
          const computerWeapon = weapons[computerChoice]
          setUserSelection(userChoice)
          weaponAudio[userChoice].currentTime = 0
          weaponAudio[userChoice].play()

          const boutResult = (userChoice, computerChoice, winner) => {
            setMessage(`You threw ${userChoice}`)
            let resultMessage = ''

            setTimeout(() => {
              if (winner === 'user') {
                const damage = userWeapon.beats.indexOf(computerChoice) === 0 ? 30 : 20
                resultMessage = `ROBOT TOOK ${damage} DAMAGE!!`
                setComputerHealth((h) => (h - damage > 0 ? h - damage : 0))
                if (computerHealth - damage <= 0) setWinner('user')
              } else if (winner === 'computer') {
                const damage = computerWeapon.beats.indexOf(userChoice) === 0 ? 30 : 20
                resultMessage = `YOU TOOK ${damage} DAMAGE!!`
                setUserHealth((h) => (h - damage > 0 ? h - damage : 0))
                if (userHealth - damage <= 0) setWinner('computer')
              } else resultMessage = 'NO DAMAGE!!'

              setMessage(
                `You threw ${userChoice}, robot threw ${computerChoice}, ${resultMessage}!!`
              )
              setComputerSelection(computerChoice)
              weaponAudio[computerChoice].currentTime = 0
              weaponAudio[computerChoice].play()
              setTimeout(() => setBoutNumber((b) => b + 1), 1800)
            }, 1600)
          }

          if (computerWeapon.beats.includes(userChoice)) {
            boutResult(userChoice, computerChoice, 'computer')
          } else if (userWeapon.beats.includes(computerChoice)) {
            boutResult(userChoice, computerChoice, 'user')
          } else {
            boutResult(userChoice, computerChoice, null)
          }
        }
        setTimeout(() => runHandpose(), 500)
      }
    }
  }, [timer])

  useEffect(() => {
    async function loadHandPose() {
      const net = await handpose.load()
      setHandPoseNet(net)
      detect(net, webcamRef)
    }
    loadHandPose()
    music.currentTime = 0
    for (const e in soundFx) soundFx[e].volume = 1
    for (const e in weaponAudio) weaponAudio[e].volume = 1

    return () => {
      music.pause()
      for (const e in soundFx) soundFx[e].volume = 0
      for (const e in weaponAudio) weaponAudio[e].volume = 0
    }
  }, [])

  useEffect(() => {
    if (boutNumber === 0) return
    if (winner) {
      music.pause()
      music.currentTime = 0
      const userWon = winner === 'user'
      const sound = soundFx[userWon ? 'win' : 'lose']
      setMessage(userWon ? 'YOU WON!!' : 'YOU LOST!!')
      sound.currentTime = 0
      sound.play()
      setTimeout(() => {
        setGameRunning(false)
        setMessage('Play again?')
      }, 3000)
    } else {
      startBout()
    }
  }, [boutNumber])

  return (
    <div className="computerbattle">
      <Grid container alignItems="center" direction="row" className={classes.gameGrid}>
        <Grid item xs={12} sm={12} md={5} lg={5}>
          <Stack direction="column" justify="space-between" className={classes.robotSection}>
            <div className={classes.robot}>
              <img src={robot} alt="robot opponent" className={classes.robotImg} />
            </div>
            <div className={classes.healthbarContainer}>
              <div className={classes.healthbar} style={{ width: `${computerHealth}%` }} />
            </div>
          </Stack>
        </Grid>
        <Grid item xs={12} md={2} sm={6} lg={2}>
          <div className={classes.gameDialog}>
            <section className={classes.dialogTop}>
              {!gameRunning ? (
                <>
                  <p>You dare to challenge me, human?</p>
                  {handPoseNet && (
                    <button className={classes.startBtn} onClick={startGameLoop}>
                      Begin
                    </button>
                  )}
                </>
              ) : (
                <p>choose your weapon</p>
              )}
            </section>
            <div className={classes.iconContainer}>
              <img
                alt="your weapon"
                className={classes.weaponIcon}
                src={weaponImgs[computerSelection]}
              />
              <img
                alt="your weapon"
                src={weaponImgs[userSelection]}
                className={`${classes.weaponIcon} ${classes.userWeapon}`}
              />
            </div>
          </div>
        </Grid>
        <Grid item xs={12} sm={6} md={5} lg={5}>
          <Stack direction="column" justify="space-between" className={classes.userSection}>
            <div className={classes.webcamSection}>
              <Webcam className={classes.webcam} ref={webcamRef} />
              <p className={classes.countDown}>{timer}</p>
            </div>
            <div className={classes.healthbarContainer}>
              <div className={classes.healthbar} style={{ width: `${userHealth}%` }} />
            </div>
          </Stack>
        </Grid>
      </Grid>
      <p className={classes.messageSection}>{message}</p>
    </div>
  )
}

export default ComputerBattle
