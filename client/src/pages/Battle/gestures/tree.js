import {
  Finger,
  FingerCurl,
  FingerDirection,
  GestureDescription,
} from 'fingerpose';

export const treeGesture = new GestureDescription('tree');

treeGesture.addCurl(Finger.Thumb, FingerCurl.FullCurl, -2);
treeGesture.addCurl(Finger.Thumb, FingerCurl.HalfCurl, -1);
treeGesture.addCurl(Finger.Thumb, FingerCurl.NoCurl, 0.9);
treeGesture.addDirection(Finger.Thumb, FingerDirection.VerticalDown, 0.6);
treeGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalDownLeft, 0.3);
treeGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalDownRight, 0.3);

treeGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalLeft, -2);
treeGesture.addDirection(Finger.Thumb, FingerDirection.HorizontalRight, -2);
treeGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, -2);
treeGesture.addDirection(Finger.Thumb, FingerDirection.DiagonalUpLeft, -2);
treeGesture.addDirection(Finger.Thumb, FingerDirection.VerticalUp, -2);

treeGesture.addDirection(Finger.Middle, FingerDirection.VerticalUp, -2);
treeGesture.addDirection(Finger.Middle, FingerDirection.VerticalDown, -2);
