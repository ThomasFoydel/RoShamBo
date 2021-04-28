import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import PostForm from './components/PostForm';
import CommentForm from './components/CommentForm';
import { Link } from 'react-router-dom';
import { CTX } from 'context/Store';
import {
  makeStyles,
  Card,
  Typography,
  Avatar,
  Grid,
  IconButton,
} from '@material-ui/core';
import { Delete as DeleteIcon } from '@material-ui/icons';
const useStyles = makeStyles((theme) => ({
  forum: {
    marginTop: '5rem',
    paddingBottom: '5rem',
  },
  post: {
    position: 'relative',
    background: '#eee',
    margin: '2em',
    color: theme.palette.primary.dark,
    padding: '1em',
    [theme.breakpoints.down('md')]: {
      margin: '2em 1em',
    },
    [theme.breakpoints.down('xs')]: {
      padding: '0.5em',
    },
  },
  postAvatar: {
    background: theme.palette.primary.dark,
  },
  postContent: {
    background: 'white',
    padding: '1.5em .5em',
    margin: '.5em',
    marginBottom: '2em',
    borderRadius: '10px',
    maxHeight: '40rem',
    overFlowY: 'auto',
  },
  postTitle: {
    textAlign: 'center',
    fontSize: '3.4rem',
    letterSpacing: '0.25rem',
    fontWeight: 'bold',
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.8rem',
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.5rem',
    },
  },
  authorName: {
    color: theme.palette.primary.dark,
    fontSize: '1.2rem',
    marginLeft: '0.25em',
  },
  comments: {
    padding: '1em',
    maxWidth: '100%',
    [theme.breakpoints.down('xs')]: {
      padding: '0',
    },
  },
  comment: {
    background: '#111',
    borderRadius: '10px',
    padding: '.75em',
    color: theme.palette.primary.light,
    margin: '.5em',
    maxWidth: '100%',
    [theme.breakpoints.down('xs')]: {
      margin: '0.5em 0',
    },
  },
  commentAvatar: { background: theme.palette.primary.light },
  commentAuthor: {
    color: theme.palette.primary.light,
    marginLeft: '0.25em',
    fontSize: '1.2rem',
  },
  commentContent: {
    ...theme.centerHorizontal,
    background: 'rgba(255,255,255,0.08)',
    padding: '1.5em .5em',
    margin: '.5em',
    borderRadius: '10px',
    maxHeight: '20rem',
    overFlowY: 'auto',
    width: '90%',
    maxWidth: '70vw',
    overflowWrap: 'break-word',
  },
  deleteBtn: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
}));

const Comment = ({ props: { comment, userId, deleteComment } }) => {
  const classes = useStyles();
  return (
    <div className={classes.comment}>
      <Grid container direction='column'>
        <Grid item style={{ position: 'relative' }}>
          <Link to={`/profile/${comment.author._id}`}>
            <Grid container alignItems='center'>
              <Grid item>
                <Link to={`/profile/${comment.author._id}`}>
                  <Avatar
                    src={`/api/image/${comment.author.profilePic}`}
                    className={classes.commentAvatar}
                  >
                    {comment.author.name &&
                      comment.author.name[0].toUpperCase()}
                  </Avatar>
                </Link>
              </Grid>
              <Grid item>
                <Typography className={classes.commentAuthor}>
                  {comment.author.name}
                </Typography>
              </Grid>
            </Grid>
          </Link>
          {comment.author._id === userId && (
            <IconButton
              onClick={() => deleteComment(comment._id)}
              className={classes.deleteBtn}
              aria-label='delete'
              style={{ color: 'white' }}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Grid>
        <Grid item>
          <Typography className={classes.commentContent}>
            {comment.content}
          </Typography>
        </Grid>
      </Grid>
    </div>
  );
};
const Post = ({
  props: {
    post,
    setPosts,
    token,
    userId,
    deletePost,
    deleteComment,
    isLoggedIn,
  },
}) => {
  const classes = useStyles();

  return (
    <Card className={classes.post}>
      <Grid container direction='column'>
        <Grid item>
          <Grid container alignItems='center'>
            <Grid item>
              <Link to={`/profile/${post.author._id}`}>
                <Avatar
                  src={`/api/image/${post.author.profilePic}`}
                  className={classes.postAvatar}
                >
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
                aria-label='delete'
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
          <Typography className={classes.postContent}>
            {post.content}
          </Typography>
        </Grid>
        <Grid item className={classes.comments}>
          {post.comments.map((comment) => (
            <Comment
              key={comment._id}
              props={{ comment, userId, deleteComment }}
            />
          ))}
        </Grid>
        <Grid item>
          {isLoggedIn && (
            <CommentForm props={{ postId: post._id, setPosts, token }} />
          )}
        </Grid>
      </Grid>
    </Card>
  );
};
const Forum = () => {
  const [appState] = useContext(CTX);
  const { token } = appState.auth;
  const { isLoggedIn } = appState;
  const userId = appState.user.id;
  const [posts, setPosts] = useState([]);
  const classes = useStyles();

  useEffect(() => {
    axios
      .get('/api/forum/posts')
      .then(({ data }) => setPosts(data))
      .catch((err) => console.log({ err }));
  }, [token]);

  const deletePost = (id) => {
    console.log({ id });
    axios
      .delete(`/api/forum/post/${id}`, { headers: { 'x-auth-token': token } })
      .then(
        ({ data }) =>
          data && setPosts((posts) => posts.filter((p) => p._id !== data))
      )
      .catch((err) => console.log(err));
  };
  const deleteComment = (id) => {
    axios
      .delete(`/api/forum/comment/${id}`, {
        headers: { 'x-auth-token': token },
      })
      .then(
        ({ data }) =>
          data &&
          data._id &&
          setPosts((posts) => {
            const copy = [...posts];
            const post = copy.find((p) => p._id === data._id);
            Object.assign(post, data);
            return copy;
          })
      )
      .catch((err) => console.log(err));
  };

  return (
    <div className={classes.forum}>
      {isLoggedIn && <PostForm props={{ setPosts, token }} />}
      {posts.map((post) => (
        <Post
          key={post._id}
          props={{
            post,
            setPosts,
            token,
            userId,
            deletePost,
            deleteComment,
            isLoggedIn,
          }}
        />
      ))}
    </div>
  );
};

export default Forum;
