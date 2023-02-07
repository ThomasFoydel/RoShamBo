import React from 'react'
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
              <Link to={`/profile/${comment.author._id}`}>
                <Avatar
                  src={`/api/image/${comment.author.profilePic}`}
                  className={classes.commentAvatar}
                >
                  {comment.author.name && comment.author.name[0].toUpperCase()}
                </Avatar>
              </Link>
            </Grid>
            <Grid item>
              <Typography className={classes.commentAuthor}>{comment.author.name}</Typography>
            </Grid>
          </Grid>
        </Link>
        {comment.author._id === userId && (
          <IconButton
            onClick={() => deleteComment(comment._id)}
            className={classes.deleteBtn}
            aria-label="delete"
            style={{ color: 'white' }}
          >
            <DeleteIcon />
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
