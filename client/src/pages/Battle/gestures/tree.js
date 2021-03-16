import {
  Finger,
  FingerCurl,
  FingerDirection,
  GestureDescription,
} from 'fingerpose';

export const treeGesture = new GestureDescription('tree');

treeGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, -1);
treeGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, -1);
treeGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 1);
treeGesture.addCurl(Finger.Thumb, FingerDirection.VerticalDown, 1);

treeGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalLeft, -2);
treeGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, -2);
treeGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, -2);
treeGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, -2);
treeGesture.addDirection(Finger.Thumb, FingerDirection.VerticalUp, -2);
