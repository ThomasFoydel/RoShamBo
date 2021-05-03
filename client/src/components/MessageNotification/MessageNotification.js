import React, { useContext, useState } from 'react';
import { Snackbar } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { Link } from 'react-router-dom';
import { CTX } from 'context/Store';
const MessageNotification = ({
  props: {
    message: { sender, content, senderId },
    close,
  },
}) => {
  const [, updateState] = useContext(CTX);

  const handleClick = () =>
    updateState({ type: 'CURRENT_THREAD', payload: senderId });

  return (
    <Snackbar
      open={!!sender}
      onClose={close}
      autoHideDuration={5000}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    >
      {content && (
        <Alert onClose={close} severity='info'>
          <Link to='/messages' onClick={handleClick}>
            {sender}:{' '}
            {content.length < 20 ? content : `${content.substring(0, 20)}...`}
          </Link>
        </Alert>
      )}
    </Snackbar>
  );
};

export default MessageNotification;
