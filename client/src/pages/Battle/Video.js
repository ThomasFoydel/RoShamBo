import useClasses from 'customHooks/useClasses'
import { useEffect, useRef } from 'react'

const styles = () => ({
  video: {
    width: '100%',
    display: 'block',
    minWidth: '100%',
    maxHeight: '100%',
    minHeight: '100%',
    objectFit: 'cover',
    transition: 'all .8s ease',
  },
})

const Video = ({ stream }) => {
  const classes = useClasses(styles)
  const ref = useRef()

  useEffect(() => {
    if (stream) ref.current.srcObject = stream
  }, [stream])

  return <video autoPlay ref={ref} playsInline className={classes.video} />
}

export default Video
