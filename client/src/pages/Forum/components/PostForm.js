import React, { useState } from 'react';
import axios from 'axios';
import { Grid, Button, Input } from '@mui/material';
import useClasses from 'customHooks/useClasses';
const styles = (theme) => ({
  form: {
    ...theme.centerHorizontal,
    background: 'linear-gradient(to bottom right, #bbb, #eee)',
    width: '80%',
    maxWidth: '400px',
    padding: '2em',
    borderRadius: '4px',
  },
  input: {
    width: '100%',
    padding: '1em',
    margin: '.5em 0',
    background: 'white',
  },
  button: {
    padding: '1em',
    color: 'white',
    backgroundColor: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  },
});

const PostForm = ({ props: { setPosts, token } }) => {
  const classes = useClasses(styles);

  const [form, setForm] = useState({
    title: '',
    content: '',
  });
  const makePost = () => {
    if (form.content && form.title) {
      setForm({ title: '', content: '' });
      axios
        .post('/api/forum/post', form, { headers: { 'x-auth-token': token } })
        .then(({ data }) => setPosts((posts) => [data, ...posts]))
        .catch((err) => console.log('new post error ', err));
    }
  };
  const handleChange = ({ target: { id, value } }) => {
    setForm((f) => ({ ...f, [id]: value }));
  };

  const handleKeyPress = ({ charCode }) => charCode === 13 && makePost();

  return (
    <Grid
      container
      alignItems='center'
      justify='center'
      direction='column'
      className={classes.form}
    >
      <Grid item>
        <Input
          className={classes.input}
          id='title'
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder='title'
          value={form.title}
        />
      </Grid>
      <Grid item>
        <Input
          className={classes.input}
          id='content'
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder='content'
          value={form.content}
        />
      </Grid>
      <Grid item>
        <Button className={classes.button} onClick={makePost}>
          submit
        </Button>
      </Grid>
    </Grid>
  );
};

export default PostForm;
