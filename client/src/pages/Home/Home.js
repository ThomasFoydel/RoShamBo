import React from 'react';
import FriendRequests from 'components/FriendRequests/FriendRequests';
import hand from 'imgs/scissorhand.gif';
const Home = () => {
  return (
    <div>
      <img src={hand} alt='hand scissor gesture' />
      <FriendRequests />
    </div>
  );
};

export default Home;
