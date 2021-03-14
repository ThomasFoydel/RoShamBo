const express = require('express');
const authRouts = require('./Auth');

const router = express.Router();

router.use('/auth', authRouts);

module.exports = router;
