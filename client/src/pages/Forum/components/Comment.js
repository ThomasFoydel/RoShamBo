import { Link } from 'react-router-dom'
import { Delete as DeleteIcon } from '@mui/icons-material'
import { Typography, Avatar, Grid, IconButton } from '@mui/material'

const Comment = ({ props: { comment, userId, deleteComment, classes } }) => (
  <div className={classes.comment}>
    <Grid container direction="column">
      <Grid item style={{ position: 'relative' }}>
        <Link to={`/profile/${comment.author._id}`}>
          <Grid container alignItems="center">
            <Grid item>
              <Avatar
                className={classes.commentAvatar}
                src={`/api/images/${comment.author.profilePic}`}
              >
                {comment.author.name && comment.author.name[0].toUpperCase()}
              </Avatar>
            </Grid>
            <Grid item>
              <Typography className={classes.commentAuthor}>{comment.author.name}</Typography>
            </Grid>
          </Grid>
        </Link>
        {comment.author._id === userId && (
          <IconButton
            aria-label="delete"
            className={classes.deleteCommentBtn}
            onClick={() => deleteComment(comment._id)}
          >
            <DeleteIcon sx={{ color: 'inherit' }} />
          </IconButton>
        )}
      </Grid>
      <Grid item>
        <Typography className={classes.commentContent}>{comment.content}</Typography>
      </Grid>
    </Grid>
  </div>
)

export default Comment
