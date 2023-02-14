import { createContext, useReducer } from 'react'

const CTX = createContext()

export { CTX }

export function reducer(state, action) {
  const { payload, type } = action
  const { user, token, profilePic, message, update, remember } = payload || {}
  switch (type) {
    case 'LOGIN':
      localStorage.setItem('roshambo-token', token)
      localStorage.setItem('remember', !!remember)
      return {
        ...state,
        auth: { token },
        isLoggedIn: true,
        authModal: false,
        messages: user.messages,
        user: { ...user, id: user._id },
      }

    case 'LOGOUT':
      localStorage.removeItem('roshambo-token')
      localStorage.removeItem('remember')
      if (window.FB) window.FB.logout()
      return {
        ...state,
        isLoggedIn: false,
        auth: { token: null },
        user: { name: '', displayEmail: '' },
      }

    case 'AUTH_MODAL':
      return { ...state, authModal: payload }

    case 'CHANGE_PROFILE_PIC':
      return {
        ...state,
        user: { ...state.user, profilePic },
      }

    case 'UPDATE_USER_INFO':
      return { ...state, user: { ...state.user, ...update } }

    case 'NEW_MESSAGE':
      const copy = { ...state.messages }
      const other = message.participants.find((p) => p !== state.user.id)
      const thread = copy[other]
      const updatedThread = thread ? [...thread, message] : [message]
      const updatedMessages = { ...copy, [other]: updatedThread }
      return { ...state, messages: updatedMessages }

    case 'CURRENT_THREAD':
      return { ...state, currentThread: payload }

    case 'SET_FRIENDLIST':
      return { ...state, user: { ...state.user, friends: payload } }

    case 'REMOVE_FRIEND':
      return {
        ...state,
        user: { ...state.user, friends: state.user.friends.filter((f) => f._id !== payload) },
      }

    default:
      console.error(`REDUCER ERROR. TYPE: ${type}, PAYLOAD:${payload}`)
      return { ...state }
  }
}

export default function Store(props) {
  const stateHook = useReducer(reducer, {
    messages: {},
    authModal: false,
    isLoggedIn: false,
    currentThread: null,
    auth: { token: null },
    user: { name: '', displayEmail: '', id: null, friends: [] },
  })

  return <CTX.Provider value={stateHook}>{props.children}</CTX.Provider>
}
