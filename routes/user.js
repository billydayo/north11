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
    res.send('這是首頁')
  })

router.get('/signup', (req, res) => {
    res.status(200)
    res.send('這是登入畫面')
})

router.post('/sign-up', users.postSignup);
router.post('/log-in', users.postLogin);
router.get('/profile', auth, users.getProfile);
router.put('/change-password', auth, users.putPassword)
router.get('/check', auth, users.checkLoginStatus); //驗證登入status
router.put('/profile', auth, users.putProfile);  // 編輯使用者名稱
router.put('/update', auth, users.updateUser);//編輯全部資料
//中間的auth代表是否需要驗證登入狀態
router.get('/search/:search', (req, res) => {
    const searchs = req.params.search;
    res.status(200)
    res.send('your search is '+searchs)
})

module.exports = router;