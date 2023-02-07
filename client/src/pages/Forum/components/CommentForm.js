import React, { useState } from 'react';

import axios from 'axios';
import { Grid, Input, Button } from '@mui/material';
import useClasses from 'customHooks/useClasses';
const styles = (theme) => ({
  form: {
    ...theme.centerHorizontal,
    width: '80%',
  },
  input: {
    padding: '1em',
    marginRight: '1em',
    [theme.breakpoints.down('xs')]: {
      padding: '.4em',
      marginRight: '.4em',
    },
  },
  button: {
    padding: '1em',
    marginLeft: '1em',
    color: 'white',
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
    [theme.breakpoints.down('xs')]: {
      padding: '.4em',
      marginRight: '.4em',
    },
  },
});

const CommentForm = ({ props: { postId, setPosts, token } }) => {
  const classes = useClasses(styles);
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

  const handleKeyPress = ({ charCode }) => charCode === 13 && makeComment();

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
          onKeyPress={handleKeyPress}
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
