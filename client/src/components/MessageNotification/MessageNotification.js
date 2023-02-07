import React, { useContext, useState } from 'react';
import { Snackbar } from '@mui/material';
import { Alert } from '@mui/lab';
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
        <Alert
          onClose={close}
          severity='info'
          style={{ border: '1px solid black' }}
        >
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
