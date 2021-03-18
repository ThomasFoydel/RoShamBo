import {
  Finger,
  FingerCurl,
  FingerDirection,
  GestureDescription,
} from 'fingerpose';

export const rockGesture = new GestureDescription('rock');

for (let finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
  rockGesture.addCurl(finger, FingerCurl.FullCurl, 0.75);
  rockGesture.addCurl(finger, FingerCurl.NoCurl, -0.1);
}
rockGesture.addCurl(Finger.Pinky, FingerCurl.NoCurl, -0.7);
rockGesture.addDirection(Finger.Thumb, FingerDirection.VerticalDown, -1);
rockGesture.addDirection(Finger.Middle, FingerDirection.HorizontalLeft, -1);
rockGesture.addDirection(Finger.Middle, FingerDirection.HorizontalRight, -1);
rockGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, 1);
rockGesture.addDirection(Finger.Middle, FingerDirection.VerticalDown, 1);
rockGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, 1.2);
rockGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, 1);
