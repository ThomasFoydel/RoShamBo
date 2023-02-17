import FriendRequests from 'components/FriendRequests/FriendRequests'
import useClasses from 'customHooks/useClasses'
import hands from 'assets/images/hands.gif'

const styles = (theme) => ({
  hands: {
    ...theme.centerHorizontal,
    bottom: '0',
    opacity: '0.7',
    width: '100vw',
    position: 'absolute',
  },
})

const Home = () => {
  const classes = useClasses(styles)

  return (
    <div className={classes.home}>
      <img src={hands} className={classes.hands} alt="two hands throwing scissors and paper" />
      <FriendRequests />
    </div>
  )
}

export default Home
