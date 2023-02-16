import axios from 'axios'
import Peer from 'peerjs'
import Webcam from 'react-webcam'
import { toast } from 'react-toastify'
import { Grid, Stack, Typography } from '@mui/material'
import * as handpose from '@tensorflow-models/handpose'
import { Stop, PlayArrow, Mic, MicOff } from '@mui/icons-material'
import React, { useState, useEffect, useRef, useContext } from 'react'
import blueCube from 'assets/videos/loadingblue.mp4'
import useClasses from 'customHooks/useClasses'
import weaponImgs from 'assets/images/weapons'
import { playSound } from 'utils/utils'
import weaponAudio from 'assets/audio/weapons'
import { CTX } from 'context/Store'
import { detect } from './utils'
import soundFx from 'assets/audio/fx'
import Video from './Video'

const styles = (theme) => ({
  playerContainer: {
    height: '100%',
    display: 'flex',
    maxHeight: '100%',
    minHeight: '100%',
    padding: '0 .4rem',
    flexDirection: 'column',
    justifyContent: 'center',
    background: theme.palette.primary.dark,
    border: `2px solid ${theme.palette.primary.dark}`,
    [theme.breakpoints.down('sm')]: {
      padding: '0',
      border: 'none',
      height: 'inherit',
    },
  },
  videoContainer: {
    display: 'flex',
    minHeight: '80%',
    maxHeight: '80%',
    overflow: 'hidden',
    position: 'relative',
    borderRadius: '3rem 3rem 0 0',
  },
  myVideo: {
    width: '100%',
    display: 'block',
    maxWidth: '100%',
    minHeight: '100%',
    maxHeight: '100%',
    objectFit: 'cover',
  },
  iconLayer: {
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    position: 'absolute',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  },
  randoChoiceIcon: {
    width: '70%',
    opacity: '0.6',
    minWidth: '70%',
    minHeight: '0%',
  },
  myChoiceIcon: {
    width: '70%',
    opacity: '0.6',
    minHeight: '0%',
    transform: 'scaleX(-1)',
  },
  healthbarContainer: {
    ...theme.healthbarContainer,
    width: '100%',
    overflow: 'hidden',
    borderRadius: '0 0 3rem 3rem',
  },
  healthbar: {
    ...theme.healthbar,
    minHeight: '20%',
  },
  playerName: {
    top: '50%',
    left: '50%',
    color: 'white',
    fontSize: '2rem',
    fontWeight: 'bold',
    textAlign: 'center',
    position: 'absolute',
    whiteSpace: 'nowrap',
    letterSpacing: '.2rem',
    transform: 'translateX(-50%) translateY(-50%)',
  },
  controls: {
    right: 0,
    bottom: 0,
    display: 'flex',
    position: 'absolute',
  },
  controlBtn: {
    width: '5.7rem',
    display: 'flex',
    fontWeight: 'bold',
    alignItems: 'center',
    margin: '.2rem .1rem',
    padding: '.1rem .2rem',
    justifyContent: 'space-between',
  },
  messenger: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  messages: {
    maxWidth: '100%',
    overflowY: 'auto',
    textAlign: 'left',
    minHeight: '11rem',
    paddingTop: '.4rem',
    background: '#9a3a9b',
  },
  message: {
    lineHeight: '1.3rem',
    margin: '.2rem .1rem',
    padding: '.1rem .2rem',
    background: 'rgba(0,0,0,0.3)',
  },
  dialogSection: {
    color: 'white',
    fontSize: '1rem',
    textAlign: 'center',
    [theme.breakpoints.down('md')]: {
      paddingRight: '0.4rem',
      paddingLeft: '0.6rem',
    },
    [theme.breakpoints.down('sm')]: {
      padding: '0',
    },
  },
  dialog: {
    height: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
    background: 'purple',
    borderRadius: '1rem',
    [theme.breakpoints.down('md')]: {
      marginTop: '0',
      borderRadius: '3rem',
    },
  },
  dialogTop: {
    height: '9rem',
    [theme.breakpoints.down('md')]: {
      height: '6rem',
    },
  },
  dialogTitle: {
    maxWidth: '100%',
    padding: '0 .2rem',
    fontSize: '1.2rem',
    [theme.breakpoints.down('md')]: {
      marginTop: '1.5rem',
    },
  },
  chooseMessage: {
    top: '50%',
    width: '100%',
    color: 'white',
    fontSize: '2.5rem',
    textAlign: 'center',
    position: 'absolute',
    transform: 'translateY(-50%)',
  },
  messageInput: {
    width: '100%',
    outline: 'none',
    paddingLeft: '1.8rem',
    padding: '.5rem .2rem',
    [theme.breakpoints.down('md')]: {
      height: '4rem',
      paddingLeft: '2rem',
    },
  },
  randomBattle: {
    paddingTop: '2rem',
    paddingBottom: '20rem',
    background: theme.palette.primary.dark,
  },
  results: {
    maxWidth: '100%',
    background: 'purple',
    button: {
      width: '6rem',
      margin: '.2rem',
      padding: '.1rem .2rem',
    },
  },
  readyBtn: {
    marginBottom: '.4rem',
    padding: '.2rem .4rem',
  },
})

const initRandoData = { name: '', userId: null }

const RandomBattle = ({ props: { socketRef } }) => {
  const [{ auth, user }] = useContext(CTX)
  const { token } = auth
  const { id, name } = user
  const myPeer = useRef()
  const myCamRef = useRef()
  const callState = useRef()
  const scrollRef = useRef()
  const blueCubeRef = useRef()
  const myStreamRef = useRef()
  const randoVideoRef = useRef()
  const socket = socketRef.current
  const classes = useClasses(styles)
  const [count, setCount] = useState(null)
  const [roomId, setRoomId] = useState(null)
  const [inPool, setInPool] = useState(false)
  const [messages, setMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [handPoseNet, setHandPoseNet] = useState(null)
  const [randoStream, setRandoStream] = useState(null)
  const [randoData, setRandoData] = useState(initRandoData)
  const [userMediaLoaded, setUserMediaLoaded] = useState(false)
  const [roundProcessing, setRoundProcessing] = useState(false)
  const [friendshipExists, setFriendshipExists] = useState(true)
  const [inputFlowRunning, setInputFlowRunning] = useState(false)
  const [icons, setIcons] = useState({ video: false, audio: false })
  const [displaySelectMessage, setDisplaySelectMessage] = useState(false)

  const [randoChoice, setRandoChoice] = useState(null)
  const [randoHealth, setRandoHealth] = useState(100)
  const [myChoice, setMyChoice] = useState(null)
  const [myHealth, setMyHealth] = useState(100)
  const [winner, setWinner] = useState(null)

  function connectToNewUser(peerId, stream, roomId) {
    const call = myPeer.current.call(peerId, stream)
    callState.current = call
    let streamcount = 0
    if (call) {
      call.on('stream', (userVideoStream) => {
        streamcount += 1
        if (streamcount > 1) return
        setRandoStream(userVideoStream)
        socket.emit('randombattle-connectioncomplete', { roomId, userId: id })
      })
      call.on('close', () => {
        call.removeAllListeners()
        call.close()
        randoVideoRef.current.close()
        randoVideoRef.current.removeAllListeners()
      })

      randoVideoRef.current = call
    }
  }

  const changeStreamTrack = async (track) => {
    return Promise.all(
      callState.current.peerConnection.getSenders().map(async (sender) => {
        if (sender.track.kind === 'video') await sender.replaceTrack(track)
      })
    )
  }

  const getRoundInput = async () => {
    setRandoChoice(null)
    setDisplaySelectMessage(true)
    if (callState.current && blueCubeRef.current) {
      const blueCubeTrack = blueCubeRef.current.captureStream().getVideoTracks()[0]
      await changeStreamTrack(blueCubeTrack)
      setCount(10)
    } else {
      setTimeout(getRoundInput, 100)
    }
  }

  useEffect(() => {
    if (count === null) return
    if (count > 0) {
      const getHandPose = async () => {
        const myChoice = await detect(handPoseNet, myCamRef)
        if (myChoice) setMyChoice(myChoice)
      }
      getHandPose()

      setTimeout(() => setCount((c) => c - 1), 500)
    } else {
      if (!myChoice) return setCount(10)
      setTimeout(() => {
        socket.emit('randombattle-userchoice', {
          roomId,
          userId: id,
          userChoice: myChoice,
        })
        setCount(null)
      }, 500)
    }
  }, [count])

  useEffect(() => {
    return () => {
      if (socket) {
        socket.off('randombattle-opponentinfo')
        socket.off('randombattle-roundoutcome')
        socket.off('randombattle-userconnect')
        socket.off('randombattle-pooljoined')
        socket.off('rando-left-the-building')
        socket.off('randombattle-gamebegin')
        socket.off('randombattle-message')
        socket.emit('leave-randomroom', roomId)
      }
    }
  }, [])

  const handleUserMedia = (stream) => {
    myStreamRef.current = stream
    async function loadHandPose() {
      const net = await handpose.load()
      setHandPoseNet(net)
    }

    loadHandPose().then(() => {
      socket.on('randombattle-pooljoined', () => setInPool(true))
      socket.on('randombattle-userconnect', ({ roomId, rando }) => {
        const { userId, peerId, name } = rando
        setRoomId(roomId)
        setRandoData({ name, userId })
        connectToNewUser(peerId, stream, roomId)
      })

      socket.on('randombattle-opponentinfo', ({ rando, roomId }) => {
        const { userId, name } = rando
        setRandoData({ name, userId })
        setRoomId(roomId)
      })

      socket.on('randombattle-gamebegin', () => {
        if (!inputFlowRunning) {
          setWinner(null)
          setRandoHealth(100)
          setMyHealth(100)
          setMyChoice(null)
          setRandoChoice(null)
          setInputFlowRunning(true)
          setTimeout(getRoundInput, 8000)
        }
      })

      socket.on('randombattle-roundoutcome', async (outcome) => {
        if (!roundProcessing) {
          setRoundProcessing(true)
          const { tie, winner, loser, newState, gameOver, tieWeapon, ...roundChoices } = outcome

          setDisplaySelectMessage(false)
          if (callState.current) {
            const myStreamTrack = myStreamRef.current.getVideoTracks()[0]
            await changeStreamTrack(myStreamTrack)
          }

          if (tie) {
            playSound(soundFx.tie)
            setRandoChoice(tieWeapon)
          } else {
            const winningWeapon = weaponAudio[outcome[outcome.winner]]
            const sounds = [winningWeapon, soundFx.fightShort]
            sounds.forEach((s) => playSound(s))
            const { gameRunning, round, choices, ...health } = newState
            for (const key in health) {
              if (key === id) setMyHealth(health[key])
              else {
                setRandoChoice(roundChoices[key])
                setRandoHealth(health[key])
              }
            }
          }

          if (gameOver) {
            setTimeout(() => {
              if (winner === id) playSound(soundFx.win)
              else playSound(soundFx.lose)
              setWinner(winner)
              setTimeout(() => setInputFlowRunning(false), 3000)
            }, 5000)
          } else {
            setTimeout(() => {
              setRoundProcessing(false)
              getRoundInput()
            }, 5000)
          }
        }
      })

      socket.on('randombattle-message', (message) =>
        setMessages((messages) => [...messages, message])
      )

      socket.on('rando-left-the-building', () => {
        setInPool(false)
        resetState()
      })

      setUserMediaLoaded(true)
    })
  }

  const handleReady = () => {
    myPeer.current = new Peer()
    myPeer.current.on('open', (peerId) => {
      socket.emit('join-random-pool', {
        peerId,
        token: token,
        socketId: socket.id,
      })
    })
    myPeer.current.on('call', function (call) {
      callState.current = call
      call.answer(myStreamRef.current, { metadata: socket.id })
      call.on('stream', function (callStream) {
        setRandoStream(callStream)
      })
    })
  }

  const playStop = () => {
    if (myStreamRef.current) {
      const enabled = myStreamRef.current.getVideoTracks()[0].enabled
      setIcons({ ...icons, video: !icons.video })
      if (enabled) myStreamRef.current.getVideoTracks()[0].enabled = false
      else myStreamRef.current.getVideoTracks()[0].enabled = true
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!chatInput) return
    socket.emit('randombattle-message', {
      name,
      roomId,
      content: chatInput,
    })
    setChatInput('')
  }

  const handleChatInput = ({ target }) => setChatInput(target.value)

  function scrollToBottom() {
    scrollRef.current.scrollIntoView({
      inline: 'start',
      block: 'nearest',
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    if (messages && scrollRef.current) scrollToBottom()
  }, [messages])

  const toggleMute = () => {
    if (myStreamRef.current) {
      if (myStreamRef.current.getAudioTracks().length === 0) return
      const enabled = myStreamRef.current.getAudioTracks()[0].enabled
      setIcons({ ...icons, audio: !icons.audio })
      if (enabled) myStreamRef.current.getAudioTracks()[0].enabled = false
      else myStreamRef.current.getAudioTracks()[0].enabled = true
    }
  }

  const playAgain = () => {
    setWinner(null)
    socket.emit('randombattle-playagain', roomId)
  }

  useEffect(() => {
    randoData.userId &&
      axios
        .get(`/api/user/profiles/${randoData.userId}`, { headers: { 'x-auth-token': token } })
        .then(({ data: { friendship } }) => setFriendshipExists(!!friendship))
        .catch(({ response }) => toast.error(response?.data?.message))
  }, [randoData])

  const handleAddFriend = () => {
    randoData.userId &&
      axios
        .post(
          '/api/user/friendships',
          { id: randoData.userId },
          { headers: { 'x-auth-token': token } }
        )
        .then(() => setFriendshipExists(true))
        .catch(({ response }) => toast.error(response?.data?.message))
  }

  const resetState = () => {
    setCount(null)
    setWinner(null)
    setRoomId(null)
    setMessages([])
    setChatInput('')
    setMyHealth(100)
    setMyChoice(null)
    setRandoHealth(100)
    setRandoStream(null)
    setRandoChoice(null)
    setRoundProcessing(false)
    setFriendshipExists(true)
    setInputFlowRunning(false)
    randoVideoRef.current = null
    setRandoData(initRandoData)
  }

  const handleBackToPool = () => {
    if (randoVideoRef.current) {
      randoVideoRef.current.close()
      randoVideoRef.current.removeAllListeners()
    }
    myPeer.current.destroy()
    socket.emit('leave-randomroom', roomId)
    resetState()
    handleReady()
  }

  return (
    <div className={classes.randomBattle}>
      <Grid container direction="column">
        <Grid item>
          <Grid container alignContent="stretch" direction="row">
            <Grid item xs={12} sm={12} md={5} lg={5}>
              <Stack direction="column" className={classes.playerContainer}>
                <div className={classes.videoContainer}>
                  <Video stream={randoStream} />

                  <div
                    className={classes.iconLayer}
                    style={{
                      background: randoChoice ? 'rgba(255,255,255,0.125)' : 'rgba(255,255,255,0)',
                    }}
                  >
                    <img
                      className={classes.randoChoiceIcon}
                      alt={`rando choice: ${randoChoice}`}
                      src={weaponImgs[randoChoice || 'blank']}
                    />
                  </div>
                  {displaySelectMessage && (
                    <div className={classes.chooseMessage}>choose your weapon</div>
                  )}
                </div>
                <div className={classes.healthbarContainer}>
                  <div className={classes.healthbar} style={{ width: `${randoHealth}%` }}></div>
                  <div className={classes.playerName}>{randoData.name}</div>
                </div>
              </Stack>
            </Grid>
            <Grid item xs={12} md={2} sm={6} lg={2} className={classes.dialogSection}>
              <Stack direction="column" justifyContent="space-between" className={classes.dialog}>
                <div className={classes.dialogTop}>
                  {winner ? (
                    <div className={classes.results}>
                      <div className={classes.dialogTitle}>
                        {winner === id ? 'You' : 'Opponent'} won!
                      </div>
                      <button onClick={playAgain}>rematch</button>
                      {!friendshipExists && <button onClick={handleAddFriend}>add friend</button>}
                      <button onClick={handleBackToPool}>next user</button>
                    </div>
                  ) : (
                    <>
                      <p className={classes.dialogTitle}>RANDOM BATTLE</p>

                      {userMediaLoaded && !inPool && (
                        <button className={classes.readyBtn} onClick={handleReady}>
                          I'm ready
                        </button>
                      )}

                      {inPool && !randoData?.userId && (
                        <Typography>Waiting for opponent...</Typography>
                      )}
                    </>
                  )}
                </div>

                <div className={classes.messenger}>
                  <ul className={classes.messages}>
                    {messages &&
                      messages.map((message, i) => (
                        <li key={i} className={classes.message}>
                          <strong>{message.name}</strong>: {message.content}
                        </li>
                      ))}
                    <div ref={scrollRef} />
                  </ul>

                  {randoStream && roomId && (
                    <form onSubmit={handleSubmit}>
                      <input
                        type="text"
                        value={chatInput}
                        placeholder="message..."
                        onChange={handleChatInput}
                        className={classes.messageInput}
                      />
                    </form>
                  )}
                </div>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={5} lg={5}>
              <Stack className={classes.playerContainer}>
                <div className={classes.videoContainer}>
                  <Webcam
                    muted
                    audio
                    ref={myCamRef}
                    className={classes.myVideo}
                    onUserMedia={handleUserMedia}
                  />
                  <div
                    className={classes.iconLayer}
                    style={{
                      background: myChoice ? 'rgba(255,255,255,0.125)' : 'rgba(255,255,255,0)',
                    }}
                  >
                    <img
                      alt="randos choice"
                      className={classes.myChoiceIcon}
                      src={weaponImgs[myChoice || 'blank']}
                    />
                  </div>
                  <div className={classes.controls}>
                    <button onClick={playStop} className={classes.controlBtn}>
                      {!icons.video ? <Stop /> : <PlayArrow />}
                      <span>{!icons.video ? 'stop' : 'start'}</span>
                    </button>
                    <button className={classes.controlBtn} onClick={toggleMute}>
                      {!icons.audio ? <Mic /> : <MicOff />}
                      <span> {!icons.audio ? 'Mute' : 'Unmute'}</span>
                    </button>
                  </div>
                </div>

                <div className={classes.healthbarContainer}>
                  <div className={classes.healthbar} style={{ width: `${myHealth}%` }}></div>
                  <div className={classes.playerName}>{name}</div>
                </div>
              </Stack>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <video
        loop
        autoPlay
        ref={blueCubeRef}
        style={{ visibility: 'hidden', zIndex: '-1', position: 'absolute' }}
      >
        <source src={blueCube} type="video/mp4" />
      </video>
    </div>
  )
}

export default RandomBattle
