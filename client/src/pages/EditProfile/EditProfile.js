import React, { useState, useContext } from 'react';
import ImageUpload from 'components/ImageUpload/ImageUpload';
import axios from 'axios';
import { CTX } from 'context/Store';
import {
  makeStyles,
  Grid,
  Card,
  Avatar,
  Input,
  Button,
  Typography,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  editProfile: {
    ...theme.centerHorizontal,
    width: '95vw',
    marginTop: '5em',
  },
  profilePic: {
    ...theme.centerHorizontal,
    width: '65vw',
    height: '65vw',
    minWidth: '15rem',
    minHeight: '15rem',
    maxHeight: '22rem',
    maxWidth: '22rem',
  },
  sectionOne: { textAlign: 'center', padding: '2rem' },
  sectionTwo: {
    textAlign: 'center',
    padding: '2rem',
  },
  heading: {
    color: theme.palette.primary.main,
    textAlign: 'center',
    fontSize: '2rem',
    fontWeight: 'bold',
  },
  submitBtn: {
    fontWeight: 'bold',
    color: 'white',
    background: theme.palette.primary.main,
    '&:hover': {
      background: theme.palette.primary.dark,
    },
  },
}));
const EditProfile = () => {
  const [appState, updateState] = useContext(CTX);
  const classes = useStyles();
  const { token } = appState.auth;
  const { name, profilePic } = appState.user;
  const [showProfileInput, setShowProfileInput] = useState(false);
  const [profileImage, setProfileImage] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    displayEmail: '',
    bio: '',
  });

  const toggleProfile = () => setShowProfileInput((s) => !s);

  const handleProfileFile = ([file]) => file && setProfileImage(file);

  const handleImageSubmit = ([file]) => {
    if (profileImage) {
      const fd = new FormData();
      fd.append('image', file, file.name);
      axios
        .post('/api/image/upload/profilepic', fd, {
          headers: { 'x-auth-token': token },
        })
        .then(({ data }) => {
          updateState({
            type: 'CHANGE_PROFILE_PIC',
            payload: { profilePic: data },
          });
          setShowProfileInput(false);
        })
        .catch((err) => console.log(err));
    }
  };

  const handleChange = ({ target: { id, value } }) =>
    setFormData((f) => ({ ...f, [id]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const update = Object.fromEntries(
      Object.entries(formData).filter((e) => e[1].length > 0)
    );

    axios
      .put('/api/user/profile', update, {
        headers: { 'x-auth-token': token },
      })
      .then(({ data }) => {
        updateState({ type: 'UPDATE_USER_INFO', payload: { update: data } });
        setFormData({ name: '', displayEmail: '', bio: '' });
      })
      .catch((err) => console.log(err));
  };
  return (
    <>
      {console.log({ appState })}
      {appState.user && (
        <Grid
          container
          className={classes.editProfile}
          component={Card}
          alignItems='center'
        >
          <Grid
            className={classes.heading}
            item
            xl={12}
            lg={12}
            md={12}
            sm={12}
            xs={12}
            component={Typography}
          >
            Edit Profile
          </Grid>
          <Grid
            item
            xl={6}
            lg={6}
            md={6}
            sm={12}
            xs={12}
            className={classes.sectionOne}
          >
            <Avatar
              className={classes.profilePic}
              src={`/api/image/${profilePic}`}
              alt='your profile'
              onClick={toggleProfile}
            >
              {name && name[0] && name[0].toUpperCase()}
            </Avatar>
            <ImageUpload
              props={{
                toggle: toggleProfile,
                text: 'New profile pic',
                buttonText: 'Upload New Profile Picture',
                show: showProfileInput,
                handleFile: handleProfileFile,
                handleSubmit: handleImageSubmit,
                handleDelete: () => setProfileImage(null),
                btnClass: classes.submitBtn,
              }}
            />
          </Grid>
          <Grid
            item
            xl={6}
            lg={6}
            md={6}
            sm={12}
            xs={12}
            className={classes.sectionTwo}
          >
            <Grid
              container
              direction='column'
              justify='center'
              alignItems='center'
              component='form'
              spacing={3}
              onSubmit={handleSubmit}
            >
              <Grid item>
                <Typography>name: {appState.user.name}</Typography>
                <Input
                  id='name'
                  placeholder='edit name'
                  onChange={handleChange}
                  value={formData.name}
                />
              </Grid>
              <Grid item>
                <Typography>
                  display email:{appState.user.displayEmail}
                </Typography>
                <Input
                  id='displayEmail'
                  placeholder='edit display email'
                  onChange={handleChange}
                  value={formData.displayEmail}
                />
              </Grid>

              <Grid item>
                <Typography>bio: {appState.user.bio}</Typography>
                <Input
                  id='bio'
                  placeholder='edit bio'
                  onChange={handleChange}
                  value={formData.bio}
                />
              </Grid>
              <Grid item>
                <Button className={classes.submitBtn} type='submit'>
                  submit
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
    </>
  );
};

export default EditProfile;
