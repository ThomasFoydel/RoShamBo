import {
  Finger,
  FingerCurl,
  FingerDirection,
  GestureDescription,
} from 'fingerpose';

export const rockGesture = new GestureDescription('rock');

for (let finger of [
  Finger.Thumb,
  Finger.Index,
  Finger.Middle,
  Finger.Ring,
  Finger.Pinky,
]) {
  rockGesture.addCurl(finger, FingerCurl.FullCurl, 0.8);
}

for (let finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
  rockGesture.addDirection(finger, FingerDirection.VerticalDown, 0.25);
}
