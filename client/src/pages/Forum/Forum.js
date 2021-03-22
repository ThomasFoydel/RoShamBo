import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import PostForm from './components/PostForm';
import { CTX } from 'context/Store';
import { Link } from 'react-router-dom';

const Post = ({ props: { post } }) => {
  return (
    <div>
      <Link to={`/profile/${post.author._id}`}>
        <div>{post.author.name}</div>
      </Link>
      <div>{post.title}</div>
      <div>{post.content}</div>
    </div>
  );
};
const Forum = () => {
  const [appState] = useContext(CTX);
  const { token } = appState.auth;
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    axios
      .get('/api/forum', { headers: { 'x-auth-token': token } })
      .then(({ data }) => setPosts(data))
      .catch((err) => {
        console.log({ err });
      });
  }, [token]);

  return (
    <div>
      {posts.map((post) => (
        <Post key={post._id} props={{ post }} />
      ))}
      <PostForm props={{ setPosts }} />
    </div>
  );
};

export default Forum;
