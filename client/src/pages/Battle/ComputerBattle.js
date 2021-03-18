import React, { useRef, useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs'; // eslint-disable-line
import * as handpose from '@tensorflow-models/handpose';
import Webcam from 'react-webcam';
import gestures from './gestures';
import robot from 'imgs/robot.svg';
import * as fp from 'fingerpose';
import { Grid, makeStyles } from '@material-ui/core';
import weaponImgs from 'imgs/weapons';

import weaponAudio from 'audio/weapons';
import soundFx from 'audio/fx';
import themeAudio from 'audio/themes';

const weapons = {
  rock: { beats: ['scissors', 'bird'] },
  paper: { beats: ['tree', 'rock'] },
  scissors: { beats: ['bird', 'paper'] },
  bird: { beats: ['paper', 'tree'] },
  tree: { beats: ['rock', 'scissors'] },
};

const useStyles = makeStyles((theme) => ({
  gameGrid: {
    backgroundColor: 'black',
    padding: '2rem',
  },
  userVideoSection: {
    maxWidth: '100%',
    position: 'relative',
    // maxHeight: '24rem',
    minHeight: '24rem',
    background: theme.palette.common.blue,
    padding: '1rem',
    // overflow: 'hidden',
  },
  webcam: {
    maxHeight: '20rem',
    minHeight: '20rem',
    // overflow: 'hidden',
    marginLeft: 'auto',
    textAlign: 'center',
    zindex: 9,
    width: '90%',
    objectFit: 'contain',
    background: 'black',
    marginLeft: '50%',
    transform: 'translateX(-50%)',
  },
  countDown: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%) translateY(-50%)',
    top: '50%',
    fontFamily: 'OpenDyslexic',
    fontSize: '8rem',
    fontWeight: 'bold',
    color: 'white',
    zIndex: '8000',
  },
  robot: {
    maxHeight: '100%',
    maxWidth: '100%',
  },
  robotSection: {
    marginLeft: '50%',
    transform: 'translateX(-50%)',
    minHeight: '0',
    minWidth: '0',
    width: '90%',
    background: 'purple',
    padding: '1rem',
  },
  gameDialog: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'center',
    backgroundColor: theme.palette.common.magenta,
    padding: '1rem',
    minHeight: '22rem',
    fontFamily: 'OpenDyslexic',
  },
  iconContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '20rem',
    maxheight: '20rem',
    overflow: 'hidden',
  },
  weaponIcon: {
    overflow: 'hidden',
    minHeight: '9rem',
    maxHeight: '9rem',
    background: 'purple',
    padding: '1em',
    borderRadius: '1rem',
    marginTop: '.5rem',
  },
  dialogTop: {
    maxHeight: '5rem',
    minHeight: '5rem',
    lineHeight: '1.2rem',
    overflow: 'hidden',
  },
  userWeapon: {
    transform: 'scaleX(-1)',
    background: theme.palette.common.blue,
  },
  healthbarContainer: {
    width: '24rem',
    background: 'red',
    height: '4rem',
    marginLeft: '50%',
    transform: 'translateX(-50%)',
  },
  healthbar: {
    background: 'green',
    height: '4rem',
    transition: 'all 0.3s ease',
  },
}));
function ComputerBattle() {
  const classes = useStyles();
  const webcamRef = useRef(null);
  // const [music, setMusic] = useState(null);
  const [muted, setMuted] = useState(false);
  const [gameRunning, setGameRunning] = useState(false);

  // const [currentGesture, setCurrentGesture] = useState(null);
  const [timer, setTimer] = useState(null);

  const [computerSelection, setComputerSelection] = useState('blank');
  const [userSelection, setUserSelection] = useState('blank');
  const [message, setMessage] = useState('click the button to start');
  const [thinking, setThinking] = useState(false);

  const music = themeAudio.battle;
  // const [weaponSounds, setWeaponSounds] = useState(weaponAudio);
  // const [soundFx, setSoundFx] = useState(fxAudio);

  const [userHealth, setUserHealth] = useState(100);
  const [computerHealth, setComputerHealth] = useState(100);
  const [winner, setWinner] = useState(null);
  const [boutNumber, setBoutNumber] = useState(0);

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== 'undefined' &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Detect hand
      const hand = await net.estimateHands(video);
      // If there's a hand estimate gesture

      if (hand.length > 0) {
        const GE = new fp.GestureEstimator([
          gestures.scissors,
          gestures.rock,
          gestures.paper,
          gestures.bird,
          gestures.tree,
        ]);
        const gesture = await GE.estimate(hand[0].landmarks, 4);
        console.log(gesture.gestures);
        if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
          const confidence = gesture.gestures.map(
            (prediction) => prediction.confidence
          );
          const maxConfidence = confidence.indexOf(
            Math.max.apply(null, confidence)
          );

          return gesture.gestures[maxConfidence].name;
        }
      } else {
        return null;
      }
    }
  };

  const startGameLoop = () => {
    setUserHealth(100);
    setComputerHealth(100);
    setWinner(null);
    startBout();
  };

  const startBout = () => {
    if (music.paused) music.play();
    setComputerSelection('blank');
    setUserSelection('blank');
    setTimer(3);
    setGameRunning(true);
  };

  useEffect(() => {
    if (timer !== null) {
      if (timer > 0) {
        soundFx.count.currentTime = 0;
        soundFx.count.play();
        setTimeout(() => {
          setTimer((c) => c - 1);
        }, 1000);
      } else {
        soundFx.shoot.currentTime = 0;
        soundFx.shoot.play();
        setTimer(null);

        const runHandpose = async () => {
          setThinking(true);
          soundFx.fight.currentTime = 0;
          soundFx.fight.play();
          const net = await handpose.load();
          const userChoice = await detect(net);
          setThinking(false);
          soundFx.fight.pause();
          if (!userChoice) {
            setMessage('I couldnt see what you were throwing!');
            setUserSelection('blank');
            setComputerSelection('blank');
            setTimeout(() => {
              setBoutNumber((b) => b + 1);
            }, 1800);
            return;
          }

          const userWeapon = weapons[userChoice];
          const randomIndex = Math.floor(Math.random() * 5);
          const weaponOptions = Object.keys(weapons);
          const computerChoice = weaponOptions[randomIndex];
          const computerWeapon = weapons[computerChoice];
          setUserSelection(userChoice);
          weaponAudio[userChoice].currentTime = 0;
          weaponAudio[userChoice].play();

          const boutResult = (userChoice, computerChoice, winner) => {
            setMessage(`You threw ${userChoice}`);
            let resultMessage = '';

            setTimeout(() => {
              if (winner === 'user') {
                const damage =
                  userWeapon.beats.indexOf(computerChoice) === 0 ? 30 : 20;
                resultMessage = `ROBOT TOOK ${damage} DAMAGE!!`;
                setComputerHealth((h) => (h - damage > 0 ? h - damage : 0));
                if (computerHealth - damage <= 0) {
                  setWinner('user');
                }
              } else if (winner === 'computer') {
                const damage =
                  computerWeapon.beats.indexOf(userChoice) === 0 ? 30 : 20;
                resultMessage = `YOU TOOK ${damage} DAMAGE!!`;
                setUserHealth((h) => (h - damage > 0 ? h - damage : 0));
                if (userHealth - damage <= 0) {
                  setWinner('computer');
                }
              } else {
                resultMessage = 'NO DAMAGE!!';
              }

              setMessage(
                `You threw ${userChoice}, robot threw ${computerChoice}, ${resultMessage}!!`
              );
              setComputerSelection(computerChoice);
              weaponAudio[computerChoice].currentTime = 0;
              weaponAudio[computerChoice].play();
              setTimeout(() => {
                setBoutNumber((b) => b + 1);
              }, 1800);
            }, 1600);
          };

          if (computerWeapon.beats.includes(userChoice)) {
            boutResult(userChoice, computerChoice, 'computer');
          } else if (userWeapon.beats.includes(computerChoice)) {
            boutResult(userChoice, computerChoice, 'user');
          } else {
            boutResult(userChoice, computerChoice, null);
          }
        };
        runHandpose();
      }
    }
  }, [timer]);

  useEffect(() => {
    music.currentTime = 0;
    for (const e in soundFx) soundFx[e].volume = 1;
    for (const e in weaponAudio) weaponAudio[e].volume = 1;

    return () => {
      music.pause();
      for (const e in soundFx) soundFx[e].volume = 0;
      for (const e in weaponAudio) weaponAudio[e].volume = 0;
    };
  }, []);

  useEffect(() => {
    if (boutNumber > 0) {
      if (winner) {
        music.pause();
        music.currentTime = 0;
        const userWon = winner === 'user';
        // // todo: add points to user's profile if they won
        const sound = soundFx[userWon ? 'win' : 'lose'];
        setMessage(userWon ? 'YOU WON!!' : 'YOU LOST!!');
        sound.currentTime = 0;
        sound.play();
        setTimeout(() => {
          setGameRunning(false);
        }, 3000);
      } else {
        startBout();
      }
    }
  }, [boutNumber]);

  return (
    <div className='computerbattle'>
      <Grid
        container
        alignItems='center'
        direction='row'
        className={classes.gameGrid}
      >
        <Grid item md={5} lg={5} style={{ background: 'black' }}>
          <div className={classes.robotSection}>
            <img src={robot} alt='robot opponent' className={classes.robot} />
            <div className={classes.healthbarContainer}>
              <div
                className={classes.healthbar}
                style={{ width: `${computerHealth}%` }}
              ></div>
            </div>
          </div>
        </Grid>
        <Grid item md={2} lg={2}>
          <div className={classes.gameDialog}>
            <section className={classes.dialogTop}>
              {!gameRunning ? (
                <>
                  <p>You dare to challenge me, human?</p>
                  <button onClick={startGameLoop}>Begin</button>
                </>
              ) : (
                <p>choose your weapon</p>
              )}
            </section>
            <div className={classes.iconContainer}>
              <img
                src={weaponImgs[computerSelection]}
                className={classes.weaponIcon}
                alt='your weapon'
              />

              <img
                src={weaponImgs[userSelection]}
                className={`${classes.weaponIcon} ${classes.userWeapon}`}
                alt='your weapon'
              />
            </div>
          </div>
        </Grid>
        <Grid item md={5} lg={5}>
          <div className={classes.userVideoSection}>
            <Webcam className={classes.webcam} ref={webcamRef} />
            <p className={classes.countDown}>{timer}</p>
            <div className={classes.healthbarContainer}>
              <div
                className={classes.healthbar}
                style={{ width: `${userHealth}%` }}
              ></div>
            </div>
          </div>
        </Grid>
      </Grid>

      <p
        style={{
          width: '100%',
          textAlign: 'center',
          color: 'white',
          transform: 'translateY(-2.4rem)',
          fontFamily: 'OpenDyslexic',
          fontSize: '1.8rem',
          height: '2rem',
        }}
      >
        {message}
      </p>

      <p>winner: {winner}</p>
    </div>
  );
}

export default ComputerBattle;
