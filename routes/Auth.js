const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const API = require('../mongoDB/API')
const auth = require('../middleware/auth')

const router = express.Router()

const sendUser = (res, message, user, token, friendRequests) => {
  const { password, email, ...userInfo } = user
  return res
    .status(200)
    .send({ status: 'success', message, user: userInfo, token, friendRequests: friendRequests })
}

const makeToken = (user) => {
  return jwt.sign({ tokenUser: { userId: user._id, email: user.email } }, process.env.SECRET, {
    expiresIn: '1000h',
  })
}

router.post('/register', async (req, res) => {
  const { email, name, password, confirmpassword } = req.body || {}
  const allFieldsExist = email && name && password && confirmpassword
  if (!allFieldsExist) {
    return res.status(400).send({ status: 'error', message: 'All fields required' })
  }

  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if (!re.test(String(email).toLowerCase())) {
    return res.status(400).send({ status: 'error', message: 'Valid email required' })
  }

  let existingUser
  try {
    existingUser = await API.user.findByEmail(email)
    if (existingUser) {
      return res
        .status(400)
        .send({ status: 'error', message: 'Account with this email already exists' })
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: 'error', message: 'Database is down, we are working to fix this' })
  }

  if (name.length < 5 || name.length > 10) {
    return res
      .status(400)
      .send({ status: 'error', message: 'Name must be between 5 and 10 characters' })
  }

  if (password !== confirmpassword) {
    return res.status(400).send({ status: 'error', message: 'Passwords do not match' })
  }

  const secure = /^(?=.*[\w])(?=.*[\W])[\w\W]{8,}$/
  if (!secure.test(String(password).toLowerCase())) {
    return res.status(400).send({ status: 'error', message: 'Password must be more secure' })
  }

  try {
    const salt = await bcrypt.genSalt(12)
    const hasedPassword = await bcrypt.hash(password, salt)
    const user = await API.user.create({ email, name, password: hasedPassword })
    const token = makeToken(user)
    return sendUser(res, 'Registration successful', user._doc, token, [])
  } catch (err) {
    return res
      .status(500)
      .send({ status: 'error', message: 'Database is down, we are working to fix this' })
  }
})

router.post('/login', async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send({ status: 'error', message: 'All fields required' })
  }
  try {
    const user = await API.user.findByEmail(req.body.email)
    if (!user) {
      return res.status(400).send({ status: 'error', message: 'User not found' })
    }
    const passwordsMatch = await bcrypt.compare(req.body.password, user.password)

    if (passwordsMatch) {
      const token = makeToken(user)
      const friendRequests = await API.friendship.findPending(user._id)
      return sendUser(res, 'Login successful', user, token, friendRequests)
    } else {
      return res.status(401).send({ status: 'error', message: 'Incorrect auth info' })
    }
  } catch (err) {
    return res
      .status(500)
      .send({ status: 'error', message: 'Database is down, we are working to fix this' })
  }
})

router.get('/', auth, async (req, res) => {
  try {
    const { tokenUser, token } = req
    const { userId } = tokenUser
    const user = await API.user.findById(userId)
    const friendRequests = await API.friendship.findPending(userId)
    if (!user) return res.status(400).send({ status: 'error', message: 'User not found' })
    return sendUser(res, 'User found', user, token, friendRequests)
  } catch (err) {
    return res.status(500).send({ status: 'error', message: 'Database error' })
  }
})

module.exports = router
