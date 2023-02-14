import axios from 'axios'
import Peer from 'peerjs'
import Webcam from 'react-webcam'
import { toast } from 'react-toastify'
import { Grid, Stack, Typography } from '@mui/material'
import { Link, useParams } from 'react-router-dom'
import * as handpose from '@tensorflow-models/handpose'
import { Stop, PlayArrow, Mic, MicOff } from '@mui/icons-material'
import React, { useState, useEffect, useRef, useContext } from 'react'
import useClasses from 'customHooks/useClasses'
import loadingblue from 'imgs/loadingblue.gif'
import blueCube from 'imgs/loadingblue.mp4'
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
    minHeight: '100%',
    maxHeight: '100%',
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
  friendVideo: {
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
  friendChoiceIcon: {
    width: '70%',
    opacity: '0.6',
    minHeight: '0%',
    minWidth: '70%',
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
    whiteSpace: 'nowrap',
    position: 'absolute',
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
      paddingLeft: '2rem',
      height: '4rem',
    },
  },
  friendBattle: {
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
  playAgainBtn: {
    padding: '.2rem .4rem',
  },
  friendNotfound: {
    ...theme.centerHorizontal,
    padding: '2rem',
    marginTop: '4rem',
    textAlign: 'center',
    background: theme.palette.primary.dark,
    a: {
      fontWeight: 'bold',
      color: theme.palette.secondary.light,
      '&:hover': {
        color: theme.palette.secondary.main,
      },
    },
  },
})

const FriendBattle = ({ props: { socketRef } }) => {
  const [{ user, auth }] = useContext(CTX)
  const { friendshipId } = useParams()
  const { name, id } = user
  const { token } = auth

  const classes = useClasses(styles)
  const socket = socketRef.current

  const myPeer = useRef()
  const myCamRef = useRef()
  const blueCubeRef = useRef()
  const scrollRef = useRef()
  const callState = useRef()
  const myStreamRef = useRef()
  const friendVideoRef = useRef()
  const [friendData, setFriendData] = useState({})
  const [friendStream, setFriendStream] = useState(null)
  const [friendNotFound, setFriendNotFound] = useState(false)
  const [displaySelectMessage, setDisplaySelectMessage] = useState(true)

  const [count, setCount] = useState(null)
  const [messages, setMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [handPoseNet, setHandPoseNet] = useState(null)

  const [winner, setWinner] = useState(null)
  const [myHealth, setMyHealth] = useState(100)
  const [myChoice, setMyChoice] = useState(null)
  const [friendHealth, setFriendHealth] = useState(100)
  const [friendChoice, setFriendChoice] = useState(null)
  const [roundProcessing, setRoundProcessing] = useState(false)
  const [inputFlowRunning, setInputFlowRunning] = useState(false)
  const [icons, setIcons] = useState({ video: false, audio: false })

  useEffect(() => {
    return () => {
      socket.off('game-begin')
      socket.off('game-resume')
      socket.off('round-outcome')
      socket.off('user-connected')
      socket.off('user-disconnected')
      socket.off('friendbattle-message')
      socket.emit('leave-room', friendshipId)
    }
  }, [])

  useEffect(() => {
    if (count === null) return
    if (count > 0) {
      const getHandPose = async () => {
        const myChoice = await detect(handPoseNet, myCamRef)
        if (myChoice) setMyChoice(myChoice)
      }
      getHandPose()

      setTimeout(() => setCount((c) => c - 1), 1000)
    } else {
      if (!myChoice) return setCount(10)
      socket.emit('user-choice', {
        userId: id,
        roomId: friendshipId,
        userChoice: myChoice,
      })
      setCount(null)
    }
  }, [count])

  const changeStreamTrack = async (track) => {
    return Promise.all(
      callState.current.peerConnection.getSenders().map(async (sender) => {
        if (sender.track.kind === 'video') await sender.replaceTrack(track)
      })
    )
  }

  const getRoundInput = async () => {
    setFriendChoice(null)
    if (callState.current) {
      const blueCubeTrack = blueCubeRef.current.captureStream().getVideoTracks()[0]
      await changeStreamTrack(blueCubeTrack)
    }
    setDisplaySelectMessage(false)
    setCount(10)
  }

  useEffect(() => {
    return () => {
      if (socket) socket.emit('disconnect-room', socket.id)
      if (myPeer.current) myPeer.current.destroy()
    }
  }, [token])

  useEffect(() => {
    return () =>
      myStreamRef.current && myStreamRef.current.getTracks().forEach((track) => track.stop())
  }, [])

  const playStop = () => {
    if (myStreamRef.current) {
      const enabled = myStreamRef.current.getVideoTracks()[0].enabled
      setIcons({ ...icons, video: !icons.video })
      if (enabled) myStreamRef.current.getVideoTracks()[0].enabled = false
      else myStreamRef.current.getVideoTracks()[0].enabled = true
    }
  }

  const toggleMute = () => {
    if (myStreamRef.current) {
      if (myStreamRef.current.getAudioTracks().length === 0) return
      const enabled = myStreamRef.current.getAudioTracks()[0].enabled
      setIcons((icons) => ({ ...icons, audio: !icons.audio }))
      if (enabled) myStreamRef.current.getAudioTracks()[0].enabled = false
      else myStreamRef.current.getAudioTracks()[0].enabled = true
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!chatInput) return
    socket.emit('friendbattle-message', {
      name,
      content: chatInput,
      roomId: friendshipId,
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

  const handleUserMedia = (stream) => {
    async function loadHandPose() {
      const net = await handpose.load()
      setHandPoseNet(net)
    }
    loadHandPose()

    axios
      .get(`/api/battles/${friendshipId}`, { headers: { 'x-auth-token': token } })
      .then(async ({ data }) => {
        myPeer.current = new Peer()
        const friend = data.users.find((u) => u._id !== id)
        if (!friend) return setFriendNotFound(true)
        setFriendData(friend)

        myPeer.current.on('open', (peerId) => {
          socket.emit('join-room', {
            token,
            peerId,
            roomId: data.roomId,
            mySocketId: socket.id,
          })
        })

        myStreamRef.current = stream

        myPeer.current.on('call', function (call) {
          callState.current = call
          call.answer(stream, { metadata: socket.id })
          call.on('stream', function (callStream) {
            setFriendStream(callStream)
          })
        })

        socket.on('user-connected', ({ userId, mySocketId }) => {
          if (userId) connectToNewUser(userId, stream, mySocketId)
        })

        socket.on('friendbattle-message', (message) => setMessages((m) => [...m, message]))

        socket.on('user-disconnected', () => {
          if (friendVideoRef.current) friendVideoRef.current.close()
          friendVideoRef.current = null
          setFriendStream(null)
        })

        const loadState = (gameState) => {
          const { gameRunning, round, choices, ...health } = gameState
          for (const key in health) {
            if (key === id) setMyHealth(health[key])
            else setFriendHealth(health[key])
          }
        }

        socket.on('game-resume', (gameState) => {
          if (!inputFlowRunning) {
            setWinner(null)
            loadState(gameState)
            setInputFlowRunning(true)
            getRoundInput()
          }
        })

        socket.on('game-begin', () => {
          if (!inputFlowRunning) {
            setWinner(null)
            setMyHealth(100)
            setMyChoice(null)
            setFriendHealth(100)
            setFriendChoice(null)
            setInputFlowRunning(true)
            setTimeout(getRoundInput, 4000)
          }
        })

        socket.on('round-outcome', async (outcome) => {
          if (!roundProcessing) {
            setRoundProcessing(true)

            const { tie, winner, loser, newState, gameOver, tieWeapon, ...roundChoices } = outcome

            if (callState.current) {
              const myStreamTrack = myStreamRef.current.getVideoTracks()[0]
              await changeStreamTrack(myStreamTrack)
            }
            setDisplaySelectMessage(true)

            if (tie) {
              setFriendChoice(tieWeapon)
              playSound(soundFx.tie)
            } else {
              const winningWeapon = weaponAudio[outcome[outcome.winner]]
              const sounds = [winningWeapon, soundFx.fightShort]
              sounds.forEach((s) => playSound(s))
              const { gameRunning, round, choices, ...health } = newState
              for (const key in health) {
                if (key === id) setMyHealth(health[key])
                else {
                  setFriendChoice(roundChoices[key])
                  setFriendHealth(health[key])
                }
              }
            }

            if (gameOver) {
              setTimeout(() => {
                if (winner === id) playSound(soundFx.win)
                else playSound(soundFx.lose)

                setWinner(winner)

                setTimeout(() => setInputFlowRunning(false), 3000)
              }, 4000)
            } else {
              setTimeout(() => {
                setRoundProcessing(false)
                getRoundInput()
              }, 10000)
            }
          }
        })

        function connectToNewUser(userId, stream, userSocketId) {
          const call = myPeer.current.call(userId, stream, { metadata: userSocketId })
          if (call) {
            callState.current = call
            call.on('stream', (userVideoStream) => setFriendStream(userVideoStream))
            call.on('close', () => {
              call.removeAllListeners()
              call.close()
              friendVideoRef.current.close()
              friendVideoRef.current.removeAllListeners()
            })

            friendVideoRef.current = call
          }
        }
      })
      .catch(({ response }) => {
        toast.error(response?.data?.message)
        setFriendNotFound(true)
      })
  }

  const playAgain = () => {
    setWinner(null)
    socket.emit('play-again', friendshipId)
  }

  if (friendNotFound)
    return (
      <div className={classes.friendNotfound}>
        <Typography>FRIEND NOT FOUND</Typography>
        <Typography>Return to the</Typography>
        <Link to="/battle/friends">Friend Battle Directory</Link>
      </div>
    )

  return (
    <div className={classes.friendBattle}>
      <Grid container direction="column">
        <Grid item>
          <Grid container alignContent="stretch" direction="row">
            <Grid item xs={12} sm={12} md={5} lg={5}>
              <Stack direction="column" className={classes.playerContainer}>
                <div className={classes.videoContainer}>
                  {friendStream && friendStream.active ? (
                    <Video stream={friendStream} />
                  ) : (
                    <img className={classes.friendVideo} src={loadingblue} alt="friends webcam" />
                  )}

                  <div
                    className={classes.iconLayer}
                    style={{
                      background: friendChoice ? 'rgba(255,255,255,0.125)' : 'rgba(255,255,255,0)',
                    }}
                  >
                    <img
                      className={classes.friendChoiceIcon}
                      alt={`friends choice: ${friendChoice}`}
                      src={weaponImgs[friendChoice || 'blank']}
                    />
                  </div>
                  {!displaySelectMessage && (
                    <div className={classes.chooseMessage}>choose your weapon</div>
                  )}
                </div>
                <div className={classes.healthbarContainer}>
                  <div className={classes.healthbar} style={{ width: `${friendHealth}%` }}></div>
                  <div className={classes.playerName}>{friendData.name}</div>
                </div>
              </Stack>
            </Grid>
            <Grid item xs={12} md={2} sm={6} lg={2} className={classes.dialogSection}>
              <Stack direction="column" className={classes.dialog} justifyContent="space-between">
                <p className={classes.dialogTitle}>FRIEND BATTLE</p>

                <div className={classes.results}>
                  {winner && (
                    <>
                      <div>winner: {winner === id ? name : friendData.name}</div>
                      <button className={classes.playAgainBtn} onClick={playAgain}>
                        play again
                      </button>
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
                  <form onSubmit={handleSubmit}>
                    <input
                      type="text"
                      value={chatInput}
                      placeholder="message..."
                      onChange={handleChatInput}
                      className={classes.messageInput}
                    />
                  </form>
                </div>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} md={5} lg={5}>
              <Stack direction="column" className={classes.playerContainer}>
                <div className={classes.videoContainer}>
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
                      alt="my weapon choice"
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
      <video autoPlay loop ref={blueCubeRef} style={{ display: 'none' }}>
        <source src={blueCube} type="video/mp4" />
      </video>
    </div>
  )
}

const Video = ({ stream, display = true }) => {
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
      className={classes.friendVideo}
      style={{ opacity: display ? 1 : 0 }}
    />
  )
}

export default FriendBattle
