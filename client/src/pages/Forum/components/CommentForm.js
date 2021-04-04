import React, { useState, useContext } from 'react';

import axios from 'axios';
import { makeStyles, Grid, Input, Button } from '@material-ui/core';
const useStyles = makeStyles((theme) => ({
  form: {
    ...theme.centerHorizontal,
    width: '80%',
  },
  input: {
    padding: '1em',
    marginRight: '1em',
  },
  button: {
    padding: '1em',
    marginLeft: '1em',
    color: 'white',
    backgroundColor: theme.palette.primary.main,
  },
}));
const CommentForm = ({ props: { postId, setPosts, token } }) => {
  const classes = useStyles();
  const [commentInput, setCommentInput] = useState('');
  const makeComment = () => {
    if (commentInput.length > 0 && commentInput.length <= 100) {
      setCommentInput('');
      axios
        .post(
          '/api/forum/comment',
          { content: commentInput, postId },
          { headers: { 'x-auth-token': token } }
        )
        .then(({ data }) =>
          setPosts((posts) => {
            const copy = [...posts];
            const post = copy.find((p) => p._id === data._id);
            Object.assign(post, data);
            return copy;
          })
        )
        .catch((err) => {
          console.log('new comment error ', err);
        });
    }
  };
  const handleChange = ({ target: { value } }) => {
    setCommentInput(value);
  };

  return (
    <Grid
      container
      justify='center'
      alignItems='center'
      className={classes.form}
      wrap='nowrap'
    >
      <Grid item>
        <Input
          className={classes.input}
          onChange={handleChange}
          value={commentInput}
          placeholder='comment'
        />
      </Grid>
      <Grid>
        <Button
          className={classes.button}
          onClick={makeComment}
          background='primary'
        >
          submit
        </Button>
      </Grid>
    </Grid>
  );
};

export default CommentForm;
