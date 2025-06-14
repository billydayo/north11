const config = require('../config/index');
const { dataSource } = require('../db/data-source');
const logger = require('../utils/logger')('Users');
const generateJWT = require('../utils/generateJWT');
const express = require('express');
const router = express.Router();
const { addFavorite, removeFavorite } = require('../controllers/favorite');
const auth = require('../middlewares/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: dataSource.getRepository('User'),
    logger
});

router.post('/:storeId', auth, addFavorite);
router.delete('/:storeId', auth, removeFavorite);

module.exports = router;