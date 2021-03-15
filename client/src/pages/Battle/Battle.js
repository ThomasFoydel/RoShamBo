import React from 'react';
import { Link } from 'react-router-dom';

const Battle = () => {
  return (
    <div>
      <Link to='/battle/friends'>Friends</Link>
      <Link to='/battle/computer'>Computer</Link>
      <Link to='/battle/random'>Random User</Link>
    </div>
  );
};

export default Battle;
