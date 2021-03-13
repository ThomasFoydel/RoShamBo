const express = require('express');
const authRouts = require('./Auth');
// const messageRoutes = require('./Message');
const router = express.Router();

router.use('/auth', authRouts);
// router.use('/message', messageRoutes);

module.exports = router;
