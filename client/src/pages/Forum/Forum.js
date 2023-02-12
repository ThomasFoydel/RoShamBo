import axios from 'axios'
import { toast } from 'react-toastify'
import React, { useState, useEffect, useContext } from 'react'
import useClasses from 'customHooks/useClasses'
import PostForm from './components/PostForm'
import Post from './components/Post'
import { CTX } from 'context/Store'

const styles = (theme) => ({
  forum: {
    marginTop: '5rem',
    paddingBottom: '5rem',
  },
  post: {
    margin: '2em',
    padding: '1em',
    background: '#eee',
    position: 'relative',
    color: theme.palette.primary.dark,
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
    margin: '.5em',
    overFlowY: 'auto',
    maxHeight: '40rem',
    background: 'white',
    marginBottom: '2em',
    borderRadius: '10px',
    padding: '1.5em .5em',
  },
  postTitle: {
    fontWeight: 'bold',
    fontSize: '3.4rem',
    textAlign: 'center',
    letterSpacing: '0.25rem',
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.8rem',
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: '1.5rem',
    },
  },
  authorName: {
    fontSize: '1.2rem',
    marginLeft: '0.25em',
    color: theme.palette.primary.dark,
  },
  comments: {
    padding: '1em',
    maxWidth: '100%',
    [theme.breakpoints.down('xs')]: {
      padding: '0',
    },
  },
  comment: {
    margin: '.5em',
    maxWidth: '100%',
    padding: '.75em',
    background: '#111',
    borderRadius: '10px',
    color: theme.palette.primary.light,
    [theme.breakpoints.down('xs')]: {
      margin: '0.5em 0',
    },
  },
  commentAvatar: {
    background: theme.palette.primary.light,
  },
  commentAuthor: {
    fontSize: '1.2rem',
    marginLeft: '0.25em',
    color: theme.palette.primary.light,
  },
  commentContent: {
    ...theme.centerHorizontal,
    width: '90%',
    maxWidth: '70vw',
    overFlowY: 'auto',
    marginTop: '.5em',
    maxHeight: '20rem',
    borderRadius: '10px',
    padding: '1.5em .5em',
    overflowWrap: 'break-word',
    background: 'rgba(255,255,255,0.08)',
  },
  deleteBtn: {
    top: 0,
    right: 0,
    position: 'absolute',
  },
})

const Forum = () => {
  const [appState] = useContext(CTX)
  const { token } = appState.auth
  const { isLoggedIn } = appState
  const userId = appState.user.id
  const classes = useClasses(styles)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    axios
      .get('/api/forum/posts')
      .then(({ data }) => data?.posts && setPosts(data.posts))
      .catch(({ response }) => toast.error(response?.data?.message))
  }, [token])

  const deletePost = (id) => {
    axios
      .delete(`/api/forum/post/${id}`, { headers: { 'x-auth-token': token } })
      .then(
        ({ data }) =>
          data?.postId && setPosts((posts) => posts.filter((p) => p._id !== data.postId))
      )
      .catch(({ response }) => toast.error(response?.data?.message))
  }

  const deleteComment = (id) => {
    axios
      .delete(`/api/forum/comment/${id}`, { headers: { 'x-auth-token': token } })
      .then(({ data }) => {
        const { updatedPost } = data
        if (updatedPost) {
          setPosts((posts) => posts.map((p) => (p._id === updatedPost._id ? updatedPost : p)))
        }
      })
      .catch(({ response }) => toast.error(response?.data?.message))
  }

  return (
    <div className={classes.forum}>
      {isLoggedIn && <PostForm props={{ setPosts, token }} />}
      {posts.map((post) => (
        <Post
          key={post._id}
          props={{
            post,
            token,
            userId,
            classes,
            setPosts,
            isLoggedIn,
            deletePost,
            deleteComment,
          }}
        />
      ))}
    </div>
  )
}

export default Forum
