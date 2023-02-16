import FriendRequests from 'components/FriendRequests/FriendRequests'
import useClasses from 'customHooks/useClasses'
import hands from 'imgs/hands.gif'

const styles = (theme) => ({
  hands: {
    ...theme.centerHorizontal,
    bottom: '0',
    opacity: '0.7',
    width: '100vw',
    position: 'absolute',
  },
})

const Home = ({ props: { socketRef } }) => {
  const classes = useClasses(styles)

  return (
    <div className={classes.home}>
      <img src={hands} className={classes.hands} alt="two hands throwing scissors and paper" />
      <FriendRequests props={{ socketRef }} />
    </div>
  )
}

export default Home
