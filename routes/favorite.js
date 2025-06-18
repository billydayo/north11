const config = require('../config/index');
const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('Users');
const generateJWT = require('../utils/generateJWT');
const express = require('express');
const router = express.Router();
const { addFavorite, removeFavorite, getFavorites } = require('../controllers/favorite');
const auth = require('../middlewares/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: dataSource.getRepository('User'),
    logger
});

router.get('/',auth, getFavorites);
router.post('/:userId', auth, addFavorite);
router.delete('/:userId', auth, removeFavorite);

module.exports = router;