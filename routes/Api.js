const express = require('express');
const authRouts = require('./Auth');
const userRouts = require('./User');
const forumRoutes = require('./Forum');
const battleRoutes = require('./Battle');
const router = express.Router();

router.use('/auth', authRouts);
router.use('/user', userRouts);
router.use('/forum', forumRoutes);
router.use('/battle', battleRoutes);
module.exports = router;
