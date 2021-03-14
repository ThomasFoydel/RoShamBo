const express = require('express');
const authRouts = require('./Auth');
const userRouts = require('./User');

const router = express.Router();

router.use('/auth', authRouts);
router.use('/user', userRouts);
module.exports = router;
