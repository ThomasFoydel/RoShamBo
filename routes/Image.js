const mongoose = require('mongoose');
const GridFsStorage = require('multer-gridfs-storage');
const router = require('express').Router();
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();
const auth = require('../middleware/auth');
const API = require('../controller/API');

const mongoURI = process.env.MONGO_URI;
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let gfs;
conn.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'images',
  });
});
const storage = new GridFsStorage({
  url: mongoURI,
  options: { useUnifiedTopology: true },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'images',
        };
        resolve(fileInfo);
      });
    });
  },
});

const upload = multer({
  storage,
});

const deleteImage = (id) => {
  if (!id || id === 'undefined') return res.send({ err: 'no image id' });
  const _id = new mongoose.Types.ObjectId(id);
  gfs.delete(_id, (err) => {
    if (err) {
      return res.send({ err: 'image deletion error' });
    }
  });
};

router.get('/:id', ({ params: { id } }, res) => {
  if (!id || id === 'undefined') return res.send({ err: 'no image id' });
  const _id = new mongoose.Types.ObjectId(id);
  gfs.find({ _id }).toArray((err, files) => {
    if (!files || files.length === 0) {
      return res.send({ err: 'no files exist' });
    }
    gfs.openDownloadStream(_id).pipe(res);
  });
});

router.get('/', (req, res) => {
  if (!gfs) {
    res.send({ err: 'database error' });
    process.exit(0);
  }
  gfs.find().toArray((err, files) => {
    if (!files || files.length === 0) {
      return res.send({ err: 'no files' });
    } else {
      const f = files
        .map((file) => {
          if (
            file.contentType === 'image/png' ||
            file.contentType === 'image/jpeg'
          ) {
            file.isImage = true;
          } else {
            file.isImage = false;
          }
          return file;
        })
        .sort((a, b) => {
          return (
            new Date(b['uploadDate']).getTime() -
            new Date(a['uploadDate']).getTime()
          );
        });

      return res.render('index', {
        files: f,
      });
    }
  });
});

router.post(
  '/upload/profilepic',
  auth,
  upload.single('image'),
  async (req, res) => {
    const {
      file,
      tokenUser: { userId },
    } = req;

    const { id } = file;
    if (file.size > 5000000) {
      deleteImage(id);
      return res.send({ err: 'file may not exceed 5mb' });
    }

    const foundUser = await API.user.findById(userId);
    if (!foundUser) return res.send({ err: 'user not found' });
    let currentPic = foundUser.profilePic;
    if (currentPic) {
      let currentPicId = new mongoose.Types.ObjectId(currentPic);
      gfs.delete(currentPicId, (err) => {
        if (err) {
          return res.send({ err: 'database error' });
        }
      });
    }

    API.user
      .updateProfile(userId, { profilePic: id })
      .then((user) => res.send(user.profilePic))
      .catch(() => {
        return res.send({ err: 'database error' });
      });
  }
);

module.exports = router;
