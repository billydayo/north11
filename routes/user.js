const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const config = require('../config/index');
const { dataSource } = require('../db/data-source')
const users = require('../controllers/users');
const logger = require('../utils/logger')('Users');
const generateJWT = require('../utils/generateJWT');
const auth = require('../middlewares/auth')({
    secret: config.get('secret').jwtSecret,
    userRepository: dataSource.getRepository('User'),
    logger
  })

router.get('/', (req, res) => {
    res.status(200)
    res.send('OK')
  })

router.get('/signup', (req, res) => {
    res.status(200)
    res.send('signup')
})

router.get('/:search', (req, res) => {
    const searchs = req.params.search;
    res.status(200)
    res.send('your search is '+searchs)
})

router.post('/signup', users.postSignup);
router.post('/login', users.postLogin);

module.exports = router;