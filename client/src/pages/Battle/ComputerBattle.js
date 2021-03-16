import React, { useRef, useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs'; // eslint-disable-line
import * as handpose from '@tensorflow-models/handpose';
import Webcam from 'react-webcam';
import gestures from './gestures';
import battleTheme from 'audio/battle.mp3';
import robot from 'imgs/robot.svg';
import * as fp from 'fingerpose';
import { Grid, makeStyles } from '@material-ui/core';
import weaponImgs from 'imgs/weapons';
import fightFx from 'audio/fight.mp3';
const weapons = {
  rock: { beats: ['scissors', 'bird'] },
  paper: { beats: ['rock', 'tree'] },
  scissors: { beats: ['paper', 'bird'] },
  bird: { beats: ['tree', 'paper'] },
  tree: { beats: ['rock', 'scissors'] },
};

const useStyles = makeStyles((theme) => ({
  gameGrid: {
    backgroundColor: 'black',
  },
  userVideoSection: {
    maxWidth: '100%',
    position: 'relative',
  },
  webcam: {
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
    textAlign: 'center',
    backgroundColor: 'red',
    padding: '1rem',
    minHeight: '100%',
  },
  weaponIcon: {
    maxWidth: '100%',
  },
}));
function ComputerBattle() {
  const classes = useStyles();
  const webcamRef = useRef(null);
  const [music, setMusic] = useState(null);
  const [muted, setMuted] = useState(false);
  const [gameRunning, setGameRunning] = useState(false);

  const [currentGesture, setCurrentGesture] = useState(null);
  const [timer, setTimer] = useState(null);

  const [computerSelection, setComputerSelection] = useState(null);
  const [userSelection, setUserSelection] = useState(null);
  const [message, setMessage] = useState('');
  const [thinking, setThinking] = useState(false);
  const [fightSound, setFightSound] = useState(new Audio(fightFx));

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

        if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
          const confidence = gesture.gestures.map(
            (prediction) => prediction.confidence
          );
          const maxConfidence = confidence.indexOf(
            Math.max.apply(null, confidence)
          );
          setCurrentGesture(gesture.gestures[maxConfidence].name);
          return gesture.gestures[maxConfidence].name;
        }
      } else {
        setCurrentGesture(null);
        return null;
      }
    }
  };

  const startGameLoop = () => {
    if (music.paused) music.play();
    setTimer(2);
    setGameRunning(true);
  };

  useEffect(() => {
    if (timer !== null) {
      if (timer > 0) {
        setTimeout(() => {
          setTimer((c) => c - 1);
        }, 1000);
      } else {
        setTimer(null);

        const runHandpose = async () => {
          setThinking(true);
          if (!music.paused) music.pause();
          fightSound.currentTime = 0;
          fightSound.play();
          const net = await handpose.load();
          const userChoice = await detect(net);
          setThinking(false);
          fightSound.pause();
          music.play();
          if (!userChoice) {
            setMessage('I couldnt see what you were throwing!');
            return setGameRunning(false);
          }

          const userWeapon = weapons[userChoice];
          const randomIndex = Math.floor(Math.random() * 5);
          const weaponOptions = Object.keys(weapons);
          const computerChoice = weaponOptions[randomIndex];
          const computerWeapon = weapons[computerChoice];
          setUserSelection(userChoice);
          setComputerSelection(computerChoice);

          if (computerWeapon.beats.includes(userChoice)) {
            setMessage(
              `You threw ${userChoice}, robot threw ${computerChoice}, YOU LOSE!!`
            );
          } else if (userWeapon.beats.includes(computerChoice)) {
            setMessage(
              `You threw ${userChoice}, robot threw ${computerChoice}, YOU WIN!!`
            );
          } else {
            setMessage(
              `You threw ${userChoice}, robot threw ${computerChoice}, TIE!!`
            );
          }
          setGameRunning(false);
        };
        runHandpose();
      }
    }
  }, [timer]);

  useEffect(() => {
    const battleSong = new Audio(battleTheme);
    battleSong.loop = true;
    setMusic(battleSong);

    return () => battleSong.pause();
  }, []);

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
          </div>
        </Grid>
        <Grid item md={2} lg={2}>
          <div className={classes.gameDialog}>
            {!gameRunning ? (
              <>
                <p>You dare to challenge me, human?</p>
                <button onClick={startGameLoop}>Begin</button>
              </>
            ) : (
              <p>choose your weapon</p>
            )}

            {computerSelection && (
              <img
                src={weaponImgs[computerSelection]}
                className={classes.weaponIcon}
                alt='your weapon'
              />
            )}

            {userSelection && (
              <img
                src={weaponImgs[userSelection]}
                className={classes.weaponIcon}
                alt='your weapon'
              />
            )}
          </div>
        </Grid>
        <Grid item md={5} lg={5}>
          <div className={classes.userVideoSection}>
            <Webcam className={classes.webcam} ref={webcamRef} />
            <p className={classes.countDown}>{timer}</p>
          </div>
        </Grid>
      </Grid>
      {/* <p>thinking is {thinking ? 'true' : 'false'}</p> */}
      <p style={{ width: '100%', textAlign: 'center' }}>{message}</p>
    </div>
  );
}

export default ComputerBattle;
