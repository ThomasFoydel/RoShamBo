import React, { useEffect, useState } from 'react';
import FriendRequests from 'components/FriendRequests/FriendRequests';
import hands from 'imgs/hands.gif';
import MessageNotification from 'components/MessageNotification/MessageNotification';
import useClasses from 'customHooks/useClasses';

const styles = (theme) => ({
  hands: {
    ...theme.centerHorizontal,
    width: '100vw',
    opacity: '0.7',
    bottom: '0',
    position: 'absolute',
  },
});

const initMessageNotification = { sender: null, content: null, senderId: null };
const Home = ({ props: { socketRef } }) => {
  const classes = useClasses(styles);
  const [messageNotification, setMessageNotification] = useState(
    initMessageNotification
  );

  useEffect(() => {
    let subscribed = true;
    socketRef.current.on('chat-message-notification', (message) => {
      if (subscribed) {
        setMessageNotification({
          sender: message.sender.name,
          content: message.content,
          senderId: message.sender._id,
        });
      }
    });
    return () => {
      subscribed = false;
      setMessageNotification(initMessageNotification);
      socketRef.current.off('chat-message-notification');
    };
  }, []);

  const closeMessageNotification = () =>
    setMessageNotification(initMessageNotification);

  return (
    <div className={classes.home}>
      <img
        src={hands}
        className={classes.hands}
        alt='two hands throwing scissors and paper'
      />
      <FriendRequests />
      <MessageNotification
        props={{
          message: messageNotification,
          severity: 'info',
          close: closeMessageNotification,
        }}
      />
    </div>
  );
};

export default Home;
