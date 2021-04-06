import React from 'react';

const CTX = React.createContext();
export { CTX };

export function reducer(state, action) {
  let { payload } = action;
  let { user, token, profilePic, message, update } = payload || {};
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
          profilePic: user.profilePic,
          bio: user.bio,
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
    case 'CHANGE_PROFILE_PIC':
      return {
        ...state,
        user: { ...state.user, profilePic },
      };
    case 'UPDATE_USER_INFO':
      return {
        ...state,
        user: { ...state.user, ...update },
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
