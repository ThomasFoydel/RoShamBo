export const isDev = () => {
  try {
    return process.env.NODE_ENV === 'development'
  } catch {
    return false
  }
}

export const playSound = (s) => {
  s.currentTime = 0
  s.play()
}
