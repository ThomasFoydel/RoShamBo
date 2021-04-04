import React, { useState, useContext } from 'react';
import { CTX } from 'context/Store';
import axios from 'axios';
import { makeStyles } from '@material-ui/core';
const useStyles = makeStyles((theme) => ({
  form: {
    background: 'white',
  },
}));
const PostForm = ({ props: { setPosts } }) => {
  const classes = useStyles();
  const [appState, updateState] = useContext(CTX);
  const [form, setForm] = useState({
    title: '',
    content: '',
  });
  const makePost = () => {
    const { token } = appState.auth;
    axios
      .post('/api/forum/post', form, { headers: { 'x-auth-token': token } })
      .then(({ data }) => setPosts((posts) => [data, ...posts]))
      .catch((err) => {
        console.log('new post error ', err);
      });
  };
  const handleChange = ({ target: { id, value } }) => {
    setForm((f) => ({ ...f, [id]: value }));
  };

  return (
    <div className={classes.form}>
      <input id='title' onChange={handleChange} placeholder='title' />
      <input id='content' onChange={handleChange} placeholder='content' />
      <button onClick={makePost}>submit</button>
    </div>
  );
};

export default PostForm;
