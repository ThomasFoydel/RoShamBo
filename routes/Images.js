require('dotenv').config()
const path = require('path')
const multer = require('multer')
const crypto = require('crypto')
const express = require('express')
const mongoose = require('mongoose')
const API = require('../mongoDB/API')
const auth = require('../middleware/auth')
const GridFsStorage = require('multer-gridfs-storage')

const router = express.Router()

const mongoURI = process.env.MONGO_URI
const conn = mongoose.createConnection(mongoURI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
})

let gfs
conn.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'images' })
})
const storage = new GridFsStorage({
  url: mongoURI,
  options: { useUnifiedTopology: true },
  file: (_, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err)
        }
        const filename = buf.toString('hex') + path.extname(file.originalname)
        const fileInfo = {
          filename: filename,
          bucketName: 'images',
        }
        resolve(fileInfo)
      })
    })
  },
})

const upload = multer({ storage })

const deleteImage = (id) => {
  if (!id || id === 'undefined')
    return res.status(400).send({ status: 'error', message: 'No image id' })
  let _id
  try {
    _id = new mongoose.Types.ObjectId(id)
  } catch (err) {
    return res.status(400).send({ status: 'error', message: 'Invalid id' })
  }
  gfs.delete(_id, (err) => {
    if (err) return res.status(500).send({ status: 'error', message: 'Image deletion error' })
  })
}

router.get('/:id', ({ params: { id } }, res) => {
  if (!id || id === 'undefined') {
    return res.status(400).send({ status: 'error', message: 'No image id' })
  }
  let _id
  try {
    _id = new mongoose.Types.ObjectId(id)
  } catch (err) {
    return res.status(400).send({ status: 'error', message: 'Invalid id' })
  }
  gfs.find({ _id }).toArray((_, files) => {
    if (!files || files.length === 0) return res.status(404).send({ err: 'Image not found' })
    gfs.openDownloadStream(_id).pipe(res)
  })
})

router.get('/', (_, res) => {
  if (!gfs) {
    return res.status(500).send({ status: 'error', message: 'Database error' })
  }
  gfs.find().toArray((_, files) => {
    if (!files || files.length === 0) return res.status(404).send({ err: 'Image not found' })

    const f = files
      .map((file) => {
        if (file.contentType === 'image/png' || file.contentType === 'image/jpeg') {
          file.isImage = true
        } else {
          file.isImage = false
        }
        return file
      })
      .sort((a, b) => new Date(b['uploadDate']).getTime() - new Date(a['uploadDate']).getTime())

    return res.status(200).json({ files: f })
  })
})

router.post('/', auth, upload.single('image'), async (req, res) => {
  const { tokenUser, file } = req
  const { userId } = tokenUser
  const { id } = file

  if (file.size > 5000000) {
    deleteImage(id)
    return res.status(400).send({ status: 'error', message: 'File may not exceed 5mb' })
  }

  const foundUser = await API.user.findById(userId)
  if (!foundUser) return res.status(404).send({ status: 'error', message: 'User not found' })
  const currentPic = foundUser.profilePic
  if (currentPic) {
    let currentPicId
    try {
      currentPicId = new mongoose.Types.ObjectId(currentPic)
      gfs.delete(currentPicId, () => console.log('Image deletion failed ', currentPicId))
    } catch (err) {
      console.log('Invalid current image id: ', currentPic, err)
    }
  }
  try {
    const updatedUser = await API.user.updateProfile(userId, { profilePic: id })
    if (!updatedUser) {
      return res.status(404).send({ status: 'error', message: 'User not found' })
    }
    return res.status(201).send({ status: 'success', message: 'Image uploaded', profilePic })
  } catch (err) {
    return res.status(500).send({ status: 'error', message: 'Database error' })
  }
})

module.exports = router
