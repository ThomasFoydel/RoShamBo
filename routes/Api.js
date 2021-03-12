const express = require('express');
const userRoutes = require('./User');
const messageRoutes = require('./Message');
const router = express.Router();

router.use('/user', userRoutes);
router.use('/message', messageRoutes);

module.exports = router;
