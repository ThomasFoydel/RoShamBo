import { Button } from '@mui/material'

const FriendRequest = ({ props: { request, reject, accept, btnClass } }) => (
  <>
    <div>{request.sender.name}</div>
    <Button className={btnClass} onClick={() => accept(request._id)}>
      accept
    </Button>
    <Button className={btnClass} onClick={() => reject(request.sender._id, request._id)}>
      reject
    </Button>
  </>
)

export default FriendRequest
