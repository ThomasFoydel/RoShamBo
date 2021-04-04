import React, { useState, useContext } from 'react';

import axios from 'axios';
import { makeStyles } from '@material-ui/core';
const useStyles = makeStyles((theme) => ({
  form: {
    background: 'white',
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
    <div className={classes.form}>
      <input
        onChange={handleChange}
        value={commentInput}
        placeholder='comment'
      />
      <button onClick={makeComment}>submit</button>
    </div>
  );
};

export default CommentForm;
