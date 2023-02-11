import axios from 'axios'
import Peer from 'peerjs'
import Webcam from 'react-webcam'
import { Grid } from '@mui/material'
import * as handpose from '@tensorflow-models/handpose'
import { Stop, PlayArrow, Mic, MicOff } from '@mui/icons-material'
import React, { useState, useEffect, useRef, useContext } from 'react'
import useClasses from 'customHooks/useClasses'
import loadingblue from 'imgs/loadingblue.gif'
import { useParams } from 'react-router-dom'
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
    minHeight: '0%',
    opacity: '0.6',
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
    textAlign: 'left',
    overflowY: 'auto',
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
  friendBattle: {
    background: 'black',
    paddingBottom: '20rem',
  },
  results: {
    maxWidth: '100%',
  },
  playAgainBtn: {
    cursor: 'pointer',
    padding: '.1rem .2rem',
    fontFamily: 'OpenDyslexic',
  },
})

const FriendBattle = ({ props: { socketRef } }) => {
  const [{ user, auth }] = useContext(CTX)
  const { name, id } = user
  const { token } = auth

  const [displayFriend, setDisplayFriend] = useState(true)
  const classes = useClasses(styles)
  const socket = socketRef.current

  const { friendshipId } = useParams()
  const myCamRef = useRef()
  const myStreamRef = useRef()
  const friendVideoRef = useRef()
  const [friendStream, setFriendStream] = useState(null)
  const [friendData, setFriendData] = useState({})

  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState([])
  const scrollRef = useRef()
  const myPeer = useRef()
  const [handPoseNet, setHandPoseNet] = useState(null)
  const [count, setCount] = useState(null)

  const [winner, setWinner] = useState(null)
  const [myHealth, setMyHealth] = useState(100)
  const [friendHealth, setFriendHealth] = useState(100)
  const [myChoice, setMyChoice] = useState(null)
  const [friendChoice, setFriendChoice] = useState(null)
  const [inputFlowRunning, setInputFlowRunning] = useState(false)
  const [roundProcessing, setRoundProcessing] = useState(false)
  const [icons, setIcons] = useState({ video: false, audio: false })

  useEffect(() => {
    return () => {
      socket.off('user-connected')
      socket.off('friendbattle-message')
      socket.off('user-disconnected')
      socket.off('game-begin')
      socket.off('round-outcome')
      socket.off('game-resume')
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

  const getRoundInput = () => {
    setFriendChoice(null)
    setDisplayFriend(false)
    setCount(10)
  }

  useEffect(() => {
    return async () => {
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
      setIcons({ ...icons, audio: !icons.audio })
      if (enabled) myStreamRef.current.getAudioTracks()[0].enabled = false
      else myStreamRef.current.getAudioTracks()[0].enabled = true
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!chatInput) return
    socket.emit('friendbattle-message', {
      content: chatInput,
      name,
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
      .get(`/api/battle/connect/${friendshipId}`, { headers: { 'x-auth-token': token } })
      .then(async ({ data }) => {
        myPeer.current = new Peer()
        for (const user of data.users) user._id !== id && setFriendData(user)

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

        socket.on('round-outcome', (outcome) => {
          if (!roundProcessing) {
            setRoundProcessing(true)

            const { tie, winner, loser, newState, gameOver, tieWeapon, ...roundChoices } = outcome

            setDisplayFriend(true)
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
  }

  const playAgain = () => {
    setWinner(null)
    socket.emit('play-again', friendshipId)
  }

  return (
    <div className={classes.friendBattle}>
      <Grid container direction="column">
        <Grid item>
          <Grid container alignContent="stretch" direction="row">
            <Grid item xs={12} sm={12} md={5} lg={5}>
              <Grid container direction="column" className={classes.playerContainer}>
                <Grid item className={classes.videoContainer}>
                  {friendStream && friendStream.active ? (
                    <Video stream={friendStream} display={displayFriend} />
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
                  {!displayFriend && (
                    <div className={classes.chooseMessage}>choose your weapon</div>
                  )}
                </Grid>
                <Grid item className={classes.healthbarContainer}>
                  <div className={classes.healthbar} style={{ width: `${friendHealth}%` }}></div>
                  <div className={classes.playerName}>{friendData.name}</div>
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
                  <p>FRIEND BATTLE</p>
                </Grid>

                <Grid item className={classes.results}>
                  {winner && (
                    <>
                      <div>winner: {winner === id ? name : friendData.name}</div>
                      <button className={classes.playAgainBtn} onClick={playAgain}>
                        play again
                      </button>
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
                  <form onSubmit={handleSubmit}>
                    <input
                      type="text"
                      value={chatInput}
                      placeholder="message..."
                      onChange={handleChatInput}
                      className={classes.messageInput}
                    />
                  </form>
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
      className={classes.friendVideo}
      style={{ opacity: display ? 1 : 0 }}
    />
  )
}

export default FriendBattle
