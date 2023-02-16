import { Finger, FingerCurl, FingerDirection, GestureDescription } from 'fingerpose'

export const paperGesture = new GestureDescription('paper')

for (let finger of [Finger.Index, Finger.Middle, Finger.Ring, Finger.Pinky]) {
  paperGesture.addCurl(finger, FingerCurl.NoCurl, 1.0)
  paperGesture.addDirection(finger, FingerDirection.VerticalUp, 1.0)
  paperGesture.addDirection(finger, FingerDirection.DiagonalUpLeft, 0.8)
  paperGesture.addDirection(finger, FingerDirection.DiagonalUpRight, 0.8)
}
