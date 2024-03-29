import { useEffect, useRef } from 'react'
import loadingblue from 'assets/images/loadingblue.gif'
import useClasses from 'customHooks/useClasses'

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

  if (stream && stream.active) {
    return <video autoPlay ref={ref} playsInline className={classes.video} />
  }
  return <img className={classes.video} src={loadingblue} alt="Waiting for opponent" />
}

export default Video
