const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const API = require('../controller/API')
const auth = require('../middleware/auth')

const router = express.Router()

const sendUser = (res, user, token, message) => {
  const { password, email, ...userInfo } = user._doc
  return res.status(200).send({ status: 'success', message, user: userInfo, token })
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

  const existingUser = await API.user.findByEmail(email)
  if (existingUser) {
    return res
      .status(400)
      .send({ status: 'error', message: 'Account with this email already exists' })
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

  API.user
    .create({ email, name, password })
    .then((user) => {
      const token = jwt.sign(
        {
          tokenUser: {
            userId: user._id,
            email: user.email,
          },
        },
        process.env.SECRET,
        { expiresIn: '1000hr' }
      )
      return sendUser(res, user, token, 'Registration successful')
    })
    .catch(() =>
      res
        .status(500)
        .send({ status: 'error', message: 'Database is down, we are working to fix this' })
    )
})

router.post('/login', async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send({ status: 'error', message: 'All fields required' })
  }
  API.user
    .findByEmail(req.body.email)
    .then(async (user) => {
      if (!user) {
        return res.status(400).send({ status: 'error', message: 'Incorrect auth info' })
      }
      const passwordsMatch = await bcrypt.compare(req.body.password, user.password)

      if (passwordsMatch) {
        const token = jwt.sign(
          {
            tokenUser: {
              userId: user._id,
              email: user.email,
            },
          },
          process.env.SECRET,
          { expiresIn: '1000h' }
        )
        return sendUser(res, user, token, 'Login successful')
      } else {
        return res.status(401).send({ status: 'error', message: 'Incorrect auth info' })
      }
    })
    .catch(() =>
      res
        .status(500)
        .send({ status: 'error', message: 'Database is down, we are working to fix this' })
    )
})

router.get('/', auth, async (req, res) => {
  const { tokenUser } = req
  const token = req.header('x-auth-token')
  if (tokenUser) {
    const { userId } = tokenUser
    return API.user
      .findById({ _id: userId })
      .then(async (user) => sendUser(res, user, token, 'User found'))
      .catch(() => res.status(500).send({ status: 'error', message: 'Database error' }))
  }
  return res.status(401).send({ status: 'error', message: 'No token' })
})

module.exports = router
