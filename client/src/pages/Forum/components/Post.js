import { Link } from 'react-router-dom'
import { Delete as DeleteIcon } from '@mui/icons-material'
import { Card, Typography, Avatar, Grid, IconButton } from '@mui/material'
import CommentForm from './CommentForm'
import Comment from './Comment'

const Post = ({
  props: { post, setPosts, token, userId, deletePost, deleteComment, isLoggedIn, classes },
}) => (
  <Card className={classes.post}>
    <Grid container direction="column">
      <Grid item>
        <Grid container alignItems="center">
          <Grid item>
            <Link to={`/profile/${post.author._id}`}>
              <Avatar src={`/api/images/${post.author.profilePic}`} className={classes.postAvatar}>
                {post.author.name && post.author.name[0].toUpperCase()}
              </Avatar>
            </Link>
          </Grid>
          <Grid item>
            <Typography
              component={Link}
              to={`/profile/${post.author._id}`}
              className={classes.authorName}
            >
              {post.author.name}
            </Typography>
          </Grid>
          {post.author._id === userId && (
            <IconButton
              onClick={() => deletePost(post._id)}
              className={classes.deleteBtn}
              aria-label="delete"
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Grid>
      </Grid>

      <Grid item>
        <Typography className={classes.postTitle}>{post.title}</Typography>
      </Grid>
      <Grid item>
        <Typography className={classes.postContent}>{post.content}</Typography>
      </Grid>
      <Grid item className={classes.comments}>
        {post.comments.map((comment) => (
          <Comment key={comment._id} props={{ comment, classes, userId, deleteComment }} />
        ))}
      </Grid>
      <Grid item>
        {isLoggedIn && <CommentForm props={{ postId: post._id, setPosts, token }} />}
      </Grid>
    </Grid>
  </Card>
)

export default Post
