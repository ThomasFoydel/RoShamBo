import { Button, Typography } from '@mui/material'

const FriendRequest = ({ props: { request, reject, accept, classes } }) => (
  <div className={classes.friendRequest}>
    <Typography className={classes.name}>{request.sender.name}</Typography>
    <Button className={classes.btn} onClick={() => accept(request._id)}>
      accept
    </Button>
    <Button className={classes.btn} onClick={() => reject(request.sender._id, request._id)}>
      reject
    </Button>
  </div>
)

export default FriendRequest
