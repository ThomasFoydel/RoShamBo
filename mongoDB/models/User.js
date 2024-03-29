const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'username required'],
    validate: {
      validator: (str) => {
        return str.length >= 5 && str.length <= 10
      },
      message: 'username must be between 5 and 10 characters',
    },
  },
  email: {
    type: String,
    required: [true, 'email required'],
    unique: true,
    select: false,
    validate: {
      validator: (str) => {
        const re =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return re.test(String(str).toLowerCase())
      },
      message: 'must be a valid email',
    },
  },
  displayEmail: {
    type: String,
    validate: {
      validator: (str) => {
        const re =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        return re.test(String(str).toLowerCase())
      },
      message: 'must be a valid email',
    },
  },
  profilePic: {
    type: String,
  },
  bio: {
    type: String,
    validate: {
      validator: (c) => c.length < 200,
      message: 'must be less than 200 characters',
    },
  },
  password: {
    type: String,
    required: [true, 'password required'],
    select: false,
  },
  exp: {
    type: Number,
    default: 0,
  },
})

userSchema.pre('save', async function save(next) {
  if (!this.isModified('password')) return next()
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = bcrypt.hash(this.password, salt)
    return next()
  } catch (err) {
    return next(err)
  }
})

userSchema.methods.validatePassword = async function validatePassword(data) {
  return bcrypt.compare(data, this.password)
}

module.exports = mongoose.model('User', userSchema)
