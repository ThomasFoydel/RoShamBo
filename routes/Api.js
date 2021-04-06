const router = require('express').Router();
const authRouts = require('./Auth');
const userRouts = require('./User');
const forumRoutes = require('./Forum');
const battleRoutes = require('./Battle');
const imageRoutes = require('./Image');

router.use('/auth', authRouts);
router.use('/user', userRouts);
router.use('/forum', forumRoutes);
router.use('/battle', battleRoutes);
router.use('/image', imageRoutes);
module.exports = router;
