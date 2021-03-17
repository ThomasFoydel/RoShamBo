import {
  Finger,
  FingerCurl,
  FingerDirection,
  GestureDescription,
} from 'fingerpose';

export const birdGesture = new GestureDescription('bird');

birdGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, 2);
birdGesture.addCurl(Finger.Pinky, FingerCurl.HalfCurl, 1);
birdGesture.addCurl(Finger.Pinky, FingerCurl.FullCurl, -1);

for (let finger of [Finger.Index, Finger.Middle, Finger.Ring]) {
  birdGesture.addCurl(finger, FingerCurl.NoCurl - 0.5);
}
birdGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, -1.0);

birdGesture.addDirection(Finger.Pinky, FingerDirection.VerticalUp, 1);
birdGesture.addDirection(Finger.Pinky, FingerDirection.DiagonalUpRight, 1);
birdGesture.addDirection(Finger.Pinky, FingerDirection.DiagonalUpLeft, 1);

birdGesture.addDirection(Finger.Pinky, FingerDirection.DiagonalDownRight, -2);
birdGesture.addDirection(Finger.Pinky, FingerDirection.DiagonalDownLeft, -2);
birdGesture.addDirection(Finger.Pinky, FingerDirection.HorizontalLeft, -2);
birdGesture.addDirection(Finger.Pinky, FingerDirection.HorizontalRight, -2);
birdGesture.addDirection(Finger.Pinky, FingerDirection.VerticalDown, -2);
