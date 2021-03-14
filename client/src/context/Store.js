import React from 'react';

const CTX = React.createContext();
export { CTX };

export function reducer(state, action) {
  let { payload } = action;
  let { user, token, profilePic, coverPic, kind, message } = payload || {};
  console.log({ user });
  switch (action.type) {
    case 'LOGIN':
      localStorage.setItem('roshambo-token', token);
      return {
        ...state,
        isLoggedIn: true,
        user: {
          id: user.id,
          name: user.name,
          displayEmail: user.displayEmail,
          coverPic: user.coverPic,
          profilePic: user.profilePic,
        },
        auth: { token },
        messages: user.messages,
        authModal: false,
      };
    case 'LOGOUT':
      localStorage.removeItem('roshambo-token');
      if (window.FB) window.FB.logout();
      return {
        ...state,
        isLoggedIn: false,
        auth: {
          token: null,
        },
        user: { name: '', displayEmail: '' },
      };
    case 'TOGGLE_AUTH_MODAL':
      return { ...state, authModal: !state.authModal };
    case 'CHANGE_PIC':
      let newPic = kind === 'coverPic' ? coverPic : profilePic;
      return {
        ...state,
        user: { ...state.user, [kind]: newPic },
      };
    case 'NEW_MESSAGE':
      let copy = { ...state.messages };
      let other = message.participants.filter((p) => p !== state.user.id)[0];
      let thread = copy[other];
      let updatedThread = thread ? [...thread, message] : [message];
      let updatedMessages = { ...copy, [other]: updatedThread };
      return { ...state, messages: updatedMessages };

    default:
      console.log('REDUCER ERROR: action: ', action);
      return { ...state };
  }
}

export default function Store(props) {
  const stateHook = React.useReducer(reducer, {
    isLoggedIn: false,
    auth: { token: null },
    authModal: false,
    user: { name: '', displayEmail: '', id: null },
    messages: {},
  });

  return <CTX.Provider value={stateHook}>{props.children}</CTX.Provider>;
}
