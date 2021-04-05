import React, { useState, useContext } from 'react';
import ImageUpload from 'components/ImageUpload/ImageUpload';
import axios from 'axios';
import { CTX } from 'context/Store';

const EditProfile = () => {
  const [appState] = useContext(CTX);
  const { token } = appState.auth;
  const [showProfileInput, setShowProfileInput] = useState(false);
  const [profileImage, setProfileImage] = useState([]);

  const toggleProfile = () => setShowProfileInput((s) => !s);

  const handleProfileFile = ([file]) => {
    console.log(file);
    setProfileImage(file);
  };

  const handleImageSubmit = (file) => {
    if (profileImage) {
      axios.post('/api/user/profilepic', file, {
        headers: { 'x-auth-token': token },
      });
    }
  };
  return (
    <div>
      <ImageUpload
        props={{
          toggle: toggleProfile,
          text: 'New profile pic',
          buttonText: 'Edit Profile Picture',
          show: showProfileInput,
          handleFile: handleProfileFile,
          handleSubmit: handleImageSubmit,
        }}
      />
    </div>
  );
};

export default EditProfile;
