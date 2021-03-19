import React, { useState, useContext } from 'react';
import { CTX } from 'context/Store';
import axios from 'axios';
const PostForm = ({ props: { setPosts } }) => {
  const [appState, updateState] = useContext(CTX);
  const [form, setForm] = useState({
    title: '',
    content: '',
  });
  const makePost = () => {
    const { token } = appState.auth;
    axios
      .post('/api/forum', form, { headers: { 'x-auth-token': token } })
      .then((res) => {
        console.log('new post response: ', res);
      })
      .catch((err) => {
        console.log('new post error ', err);
      });
  };
  const handleChange = ({ target: { id, value } }) => {
    setForm((f) => ({ ...f, [id]: value }));
  };

  return (
    <div>
      <input id='title' onChange={handleChange} placeholder='title' />
      <input id='content' onChange={handleChange} placeholder='content' />
      <button onClick={makePost}>submit</button>
    </div>
  );
};

export default PostForm;
