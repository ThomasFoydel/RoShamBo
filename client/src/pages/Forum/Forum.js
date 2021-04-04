import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import PostForm from './components/PostForm';
import CommentForm from './components/CommentForm';

import { CTX } from 'context/Store';
import { Link } from 'react-router-dom';
import { makeStyles, Card, Typography, Avatar, Grid } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  forum: {
    marginTop: '5rem',
    paddingBottom: '5rem',
  },
  post: {
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
    background: theme.palette.primary.light,
  },
  postContent: {
    background: 'white',
    padding: '1.5em .5em',
    margin: '.5em',
    marginBottom: '2em',
    borderRadius: '10px',
    maxHeight: '40rem',
    overFlowY: 'scroll',
  },
  postTitle: {
    textAlign: 'center',
    fontSize: '3rem',
    letterSpacing: '0.25rem',
    fontWeight: 'bold',
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.5rem',
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.3rem',
    },
  },
  authorName: {
    color: theme.palette.primary.dark,
    fontSize: '1.3rem',
    marginLeft: '0.25em',
  },
  comments: {
    padding: '1em',
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
    background: 'rgba(255,255,255,0.08)',
    padding: '1.5em .5em',
    margin: '.5em',
    borderRadius: '10px',
    maxHeight: '20rem',
    overFlowY: 'scroll',
  },
}));

const Comment = ({ props: { comment } }) => {
  const classes = useStyles();
  return (
    <div className={classes.comment}>
      <Grid container direction='column'>
        <Grid item>
          <Link to={`/profile/${comment.author._id}`}>
            <Grid container alignItems='center'>
              <Grid item>
                <Avatar
                  src={comment.author.profilePic}
                  className={classes.commentAvatar}
                >
                  {comment.author.name && comment.author.name[0].toUpperCase()}
                </Avatar>
              </Grid>
              <Grid item>
                <Typography className={classes.commentAuthor}>
                  {comment.author.name}
                </Typography>
              </Grid>
            </Grid>
          </Link>
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
const Post = ({ props: { post, setPosts, token } }) => {
  const classes = useStyles();
  return (
    <Card className={classes.post}>
      <Grid container direction='column'>
        <Grid item>
          <Link to={`/profile/${post.author._id}`}>
            <Grid container alignItems='center'>
              <Grid item>
                <Avatar
                  src={post.author.profilePic}
                  className={classes.postAvatar}
                >
                  {post.author.name && post.author.name[0].toUpperCase()}
                </Avatar>
              </Grid>
              <Grid item>
                <Typography className={classes.authorName}>
                  {post.author.name}
                </Typography>
              </Grid>
            </Grid>
          </Link>
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
            <Comment key={comment._id} props={{ comment }} />
          ))}
        </Grid>
        <Grid item>
          <CommentForm props={{ postId: post._id, setPosts, token }} />
        </Grid>
      </Grid>
    </Card>
  );
};
const Forum = () => {
  const [appState] = useContext(CTX);
  const { token } = appState.auth;
  const [posts, setPosts] = useState([]);
  const classes = useStyles();
  useEffect(() => {
    axios
      .get('/api/forum/posts', { headers: { 'x-auth-token': token } })
      .then(({ data }) => setPosts(data))
      .catch((err) => console.log({ err }));
  }, [token]);

  return (
    <div className={classes.forum}>
      <PostForm props={{ setPosts, token }} />
      {posts.map((post) => (
        <Post key={post._id} props={{ post, setPosts, token }} />
      ))}
    </div>
  );
};

export default Forum;
