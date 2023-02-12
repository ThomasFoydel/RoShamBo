import axios from 'axios'
import Peer from 'peerjs'
import Webcam from 'react-webcam'
import { Grid } from '@mui/material'
import * as handpose from '@tensorflow-models/handpose'
import { Stop, PlayArrow, Mic, MicOff } from '@mui/icons-material'
import React, { useState, useEffect, useRef, useContext } from 'react'
import useClasses from 'customHooks/useClasses'
import loadingblue from 'imgs/loadingblue.gif'
import weaponAudio from 'audio/weapons'
import weaponImgs from 'imgs/weapons'
import { CTX } from 'context/Store'
import { detect } from './utils'
import soundFx from 'audio/fx'

const playSound = (s) => {
  s.currentTime = 0
  s.play()
}

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
  randoVideo: {
    width: '100%',
    display: 'block',
    minWidth: '100%',
    maxHeight: '100%',
    minHeight: '100%',
    objectFit: 'cover',
    transition: 'all .8s ease',
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
    fontFamily: 'OpenDyslexic',
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
    cursor: 'pointer',
    fontWeight: 'bold',
    alignItems: 'center',
    margin: '.2rem .1rem',
    padding: '.1rem .2rem',
    fontFamily: 'OpenDyslexic',
    justifyContent: 'space-between',
  },
  messenger: {
    display: 'flex',
    maxWidth: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  messages: {
    height: '11rem',
    maxWidth: '100%',
    overflowY: 'auto',
    textAlign: 'left',
    background: 'rgba(255,255,255,0.2)',
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
    minHeight: '4rem',
    textAlign: 'center',
    background: 'purple',
    fontFamily: 'OpenDyslexic',
  },
  dialog: {
    height: '100%',
    maxWidth: '100%',
    justifyContent: 'space-between',
  },
  dialogTitle: {
    maxWidth: '100%',
    padding: '0 .2rem',
    fontSize: '1.2rem',
  },
  chooseMessage: {
    top: '50%',
    width: '100%',
    color: 'white',
    fontSize: '2.5rem',
    textAlign: 'center',
    position: 'absolute',
    fontFamily: 'OpenDyslexic',
    transform: 'translateY(-50%)',
  },
  messageInput: {
    zIndex: '2',
    padding: '.5rem .2rem',
    fontFamily: 'OpenDyslexic',
  },
  randomBattle: {
    background: 'black',
    paddingBottom: '20rem',
  },
  game: {},
  results: {
    maxWidth: '100%',
  },
  playAgainBtn: {
    cursor: 'pointer',
    padding: '.1rem .2rem',
    fontFamily: 'OpenDyslexic',
  },
  readyBtn: {
    maxWidth: '100%',
    cursor: 'pointer',
    padding: '.1rem .2rem',
    fontFamily: 'OpenDyslexic',
  },
})

const RandomBattle = ({ props: { socketRef } }) => {
  const [{ auth, user }] = useContext(CTX)
  const { token } = auth
  const { id, name } = user
  const myPeer = useRef()
  const myCamRef = useRef()
  const scrollRef = useRef()
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
  const [displayRando, setDisplayRando] = useState(true)
  const [userMediaLoaded, setUserMediaLoaded] = useState(false)
  const [roundProcessing, setRoundProcessing] = useState(false)
  const [friendshipExists, setFriendshipExists] = useState(true)
  const [inputFlowRunning, setInputFlowRunning] = useState(false)
  const [icons, setIcons] = useState({ video: false, audio: false })
  const [randoData, setRandoData] = useState({ name: '', userId: null })

  const [randoChoice, setRandoChoice] = useState(null)
  const [randoHealth, setRandoHealth] = useState(100)
  const [myChoice, setMyChoice] = useState(null)
  const [myHealth, setMyHealth] = useState(100)
  const [winner, setWinner] = useState(null)

  function connectToNewUser(peerId, stream, roomId) {
    const call = myPeer.current.call(peerId, stream)
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

  const getRoundInput = () => {
    setRandoChoice(null)
    setDisplayRando(false)
    setCount(10)
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

      socket.on('randombattle-roundoutcome', (outcome) => {
        if (!roundProcessing) {
          setRoundProcessing(true)
          const { tie, winner, loser, newState, gameOver, tieWeapon, ...roundChoices } = outcome
          setDisplayRando(true)

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

      socket.on('rando-left-the-building', () => handleBackToPool())

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
        .get(`/api/user/profile/${randoData.userId}`, { headers: { 'x-auth-token': token } })
        .then(({ data: { friendshipExists } }) => setFriendshipExists(friendshipExists))
  }, [randoData])

  const handleAddFriend = () => {
    randoData.userId &&
      axios
        .post(
          '/api/user/friendship',
          { id: randoData.userId },
          { headers: { 'x-auth-token': token } }
        )
        .then(() => setFriendshipExists(true))
  }

  const handleBackToPool = () => {
    if (randoVideoRef.current) {
      randoVideoRef.current.close()
      randoVideoRef.current.removeAllListeners()
    }
    myPeer.current.destroy()
    socket.emit('leave-randomroom', roomId)
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
    setDisplayRando(true)
    setRoundProcessing(false)
    setFriendshipExists(true)
    setInputFlowRunning(false)
    randoVideoRef.current = null
    setRandoData({ name: '', userId: null })
    handleReady()
  }

  return (
    <div className={classes.randomBattle}>
      <Grid container className={classes.game} direction="column">
        <Grid item>
          <Grid container alignContent="stretch" direction="row">
            <Grid item xs={12} sm={12} md={5} lg={5}>
              <Grid container direction="column" className={classes.playerContainer}>
                <Grid item className={classes.videoContainer}>
                  {randoStream && randoStream.active ? (
                    <Video stream={randoStream} display={displayRando} />
                  ) : (
                    <img
                      src={loadingblue}
                      alt="random user webcam"
                      className={classes.randoVideo}
                    />
                  )}

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
                  {!displayRando && <div className={classes.chooseMessage}>choose your weapon</div>}
                </Grid>
                <Grid item className={classes.healthbarContainer}>
                  <div className={classes.healthbar} style={{ width: `${randoHealth}%` }}></div>
                  <div className={classes.playerName}>{randoData.name}</div>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={2} sm={6} lg={2} className={classes.dialogSection}>
              <Grid
                container
                direction="column"
                className={classes.dialog}
                justifycontent="space-between"
              >
                <Grid item className={classes.dialogTitle}>
                  <p>RANDOM BATTLE</p>
                </Grid>

                <Grid item>
                  {userMediaLoaded && !inPool && (
                    <button className={classes.readyBtn} onClick={handleReady}>
                      I'm ready
                    </button>
                  )}
                </Grid>

                <Grid item className={classes.results}>
                  {winner && (
                    <>
                      <div>winner: {winner === id ? name : randoData.name}</div>
                      <button className={classes.playAgainBtn} onClick={playAgain}>
                        play again
                      </button>
                      {!friendshipExists && <button onClick={handleAddFriend}>add friend</button>}
                      <button onClick={handleBackToPool}>next random user</button>
                    </>
                  )}
                </Grid>
                <Grid item className={classes.messenger}>
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
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} sm={6} md={5} lg={5}>
              <Grid container direction="column" className={classes.playerContainer}>
                <Grid item className={classes.videoContainer}>
                  <Webcam
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
                </Grid>

                <Grid item className={classes.healthbarContainer}>
                  <div className={classes.healthbar} style={{ width: `${myHealth}%` }}></div>
                  <div className={classes.playerName}>{name}</div>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  )
}

const Video = ({ stream, display }) => {
  const classes = useClasses(styles)
  const ref = useRef()

  useEffect(() => {
    if (stream) ref.current.srcObject = stream
  }, [stream])

  return (
    <video
      autoPlay
      ref={ref}
      playsInline
      className={classes.randoVideo}
      style={{ opacity: display ? 1 : 0 }}
    />
  )
}

export default RandomBattle
