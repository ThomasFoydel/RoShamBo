import {
  Finger,
  FingerCurl,
  FingerDirection,
  GestureDescription,
} from 'fingerpose';

export const paperGesture = new GestureDescription('paper');

for (let finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
  paperGesture.addCurl(finger, FingerCurl.NoCurl, 1.0);
  paperGesture.addDirection(finger, FingerDirection.VerticalUp, 0.25);
}
