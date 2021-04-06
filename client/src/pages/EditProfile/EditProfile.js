import React, { useState, useContext } from 'react';
import ImageUpload from 'components/ImageUpload/ImageUpload';
import axios from 'axios';
import { CTX } from 'context/Store';
import { Avatar } from '@material-ui/core';
const EditProfile = () => {
  const [appState, updateState] = useContext(CTX);
  const { token } = appState.auth;
  const { name, profilePic } = appState.user;
  const [showProfileInput, setShowProfileInput] = useState(false);
  const [profileImage, setProfileImage] = useState([]);

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

  return (
    <>
      {appState.user && (
        <div>
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
        </div>
      )}
    </>
  );
};

export default EditProfile;
