import * as fp from 'fingerpose'
import gestures from '../gestures'

const GE = new fp.GestureEstimator(gestures)

export const detect = async (net, myCamRef) => {
  const validCamAndNet =
    net &&
    myCamRef.current !== null &&
    typeof myCamRef.current !== 'undefined' &&
    myCamRef.current.video.readyState === 4

  if (!validCamAndNet) return null

  const video = myCamRef.current.video
  const gestureEstimates = await net.estimateHands(video)
  if (gestureEstimates.length > 0) {
    const gesture = await GE.estimate(gestureEstimates[0].landmarks, 4)
    if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
      const confidence = gesture.gestures.map((prediction) => prediction.confidence)
      const maxConfidence = confidence.indexOf(Math.max.apply(null, confidence))
      return gesture.gestures[maxConfidence].name
    }
  }
}
