const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const API = require('../controller/API');
const auth = require('../middleware/auth');
const router = express.Router();

const sendUser = (res, user, token) => {
  const userInfo = {
    name: user.name,
    email: user.email,
    id: user._id,
    profilePic: user.profilePic,
    displayEmail: user.displayEmail,
    bio: user.bio,
  };
  return res.send({ user: userInfo, token });
};

router.post('/register', async (req, res) => {
  let { email, name, password, confirmpassword } = req.body || {};
  let allFieldsExist = email && name && password && confirmpassword;
  if (!allFieldsExist) {
    return res.status(400).send({ err: 'All fields required' });
  }

  const secure = /^(?=.*[\w])(?=.*[\W])[\w\W]{8,}$/;
  if (!secure.test(String(password).toLowerCase())) {
    return res.status(400).send({ err: 'Password must be more secure' });
  }

  if (name.length < 8 || name.length > 16) {
    return res
      .status(400)
      .send({ err: 'Name must be between 8 and 16 characters' });
  }

  if (password !== confirmpassword) {
    return res.status(400).send({ err: 'Passwords do not match' });
  }

  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!re.test(String(email).toLowerCase())) {
    return res.status(400).send({ err: 'Valid email required' });
  }

  const existingUser = await API.user.findByEmail(email);
  if (existingUser) {
    return res
      .status(400)
      .send({ err: 'Account with this email already exists' });
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
      );
      return sendUser(res, user, token);
    })
    .catch(() => {
      res
        .status(500)
        .send({ err: 'Database is down, we are working to fix this' });
    });
});

router.post('/login', async (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.send({ err: 'all fields required' });
  }

  API.user
    .findByEmail(req.body.email)
    .then(async (user) => {
      if (!user) {
        return res.status(400).send({ err: 'Incorrect auth info' });
      }
      const passwordsMatch = await bcrypt.compare(
        req.body.password,
        user.password
      );

      if (passwordsMatch) {
        const token = jwt.sign(
          {
            tokenUser: {
              userId: user._id,
              email: user.email,
            },
          },
          process.env.SECRET,
          { expiresIn: '1000hr' }
        );
        return sendUser(res, user, token);
      } else {
        return res.status(401).send({ err: 'Incorrect auth info' });
      }
    })
    .catch(() =>
      res.status(500).send({
        err: 'Database is down, we are working to fix this',
      })
    );
});

router.get('/', auth, async (req, res) => {
  let { tokenUser } = req;
  const token = req.header('x-auth-token');
  if (tokenUser) {
    let { userId } = tokenUser;
    API.user
      .findById({ _id: userId })
      .then(async (user) => sendUser(res, user, token))
      .catch(() => {
        res.status(500).send({ err: 'database error' });
      });
  } else {
    return res.status(401).send({ err: 'no token' });
  }
});

module.exports = router;
