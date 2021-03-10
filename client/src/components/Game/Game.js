import React, { useRef, useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs'; // eslint-disable-line
import * as handpose from '@tensorflow-models/handpose';
import Webcam from 'react-webcam';
import gestures from './gestures';
import { drawHand } from './util';

import * as fp from 'fingerpose';

function Game() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [currentGesture, setCurrentGesture] = useState(null);

  const runHandpose = async () => {
    const net = await handpose.load();
    //  Loop and detect hands
    setInterval(() => {
      detect(net);
    }, 10);
  };

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== 'undefined' &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Video and canvas setup
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Detect hand
      const hand = await net.estimateHands(video);
      // If there's a hand estimate gesture
      if (hand.length > 0) {
        const GE = new fp.GestureEstimator([
          fp.Gestures.VictoryGesture,
          gestures.rock,
          gestures.paper,
        ]);
        const gesture = await GE.estimate(hand[0].landmarks, 4);
        if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
          // console.log(gesture.gestures);
          const confidence = gesture.gestures.map(
            (prediction) => prediction.confidence
          );
          const maxConfidence = confidence.indexOf(
            Math.max.apply(null, confidence)
          );
          setCurrentGesture(gesture.gestures[maxConfidence].name);
        }
      }
      // Draw mesh
      const ctx = canvasRef.current.getContext('2d');
      drawHand(hand, ctx);
    }
  };

  useEffect(() => {
    runHandpose();
  }, [runHandpose]);

  return (
    <div className='Game'>
      <Webcam
        ref={webcamRef}
        style={{
          position: 'absolute',
          marginLeft: 'auto',
          marginRight: 'auto',
          left: 0,
          right: 0,
          textAlign: 'center',
          zindex: 9,
          width: 640,
          height: 480,
        }}
      />

      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          marginLeft: 'auto',
          marginRight: 'auto',
          left: 0,
          right: 0,
          textAlign: 'center',
          zindex: 9,
          width: 640,
          height: 480,
        }}
      />

      <h2>currentGesture: {currentGesture}</h2>
    </div>
  );
}

export default Game;
