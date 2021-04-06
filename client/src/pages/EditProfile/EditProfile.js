import React, { useState, useContext } from 'react';
import ImageUpload from 'components/ImageUpload/ImageUpload';
import axios from 'axios';
import { CTX } from 'context/Store';
import { Avatar, Input, Button, Typography } from '@material-ui/core';

const EditProfile = () => {
  const [appState, updateState] = useContext(CTX);
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
      {appState.user && (
        <div style={{ background: '#ccc' }}>
          <Avatar src={`/api/image/${profilePic}`} alt='your profile'>
            {name[0] && name[0].toUpperCase()}
          </Avatar>
          <ImageUpload
            props={{
              toggle: toggleProfile,
              text: 'New profile pic',
              buttonText: 'Edit Profile Picture',
              show: showProfileInput,
              handleFile: handleProfileFile,
              handleSubmit: handleImageSubmit,
              handleDelete: () => setProfileImage(null),
            }}
          />
          <form onSubmit={handleSubmit}>
            <Typography>{appState.user.name}</Typography>
            <Input
              id='name'
              placeholder='edit name'
              onChange={handleChange}
              value={formData.name}
            />
            <Typography>{appState.user.displayEmail}</Typography>
            <Input
              id='displayEmail'
              placeholder='edit display email'
              onChange={handleChange}
              value={formData.displayEmail}
            />
            <Typography>{appState.user.bio}</Typography>
            <Input
              id='bio'
              placeholder='edit bio'
              onChange={handleChange}
              value={formData.bio}
            />
            <Button type='submit'>submit</Button>
          </form>
        </div>
      )}
    </>
  );
};

export default EditProfile;
