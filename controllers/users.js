const bcrypt = require('bcrypt');
const { IsNull, In } = require('typeorm');
const config = require('../config/index');
const logger = require('../utils/logger')('UsersController');
const generateJWT = require('../utils/generateJWT');
const { dataSource } = require('../db/data-source')

//const { jwt } = require('../config');
const jwtSecret = process.env.JWT_SECRET; 

const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/

function isUndefined (value) {
    return value === undefined
}
function isNotValidString (value) {
    return typeof value !== 'string' || value.trim().length === 0;
}

async function postSignup (req, res, next) {
    try {
      const { name, email, password } = req.body
      if (isUndefined(name) || isNotValidString(name) || isUndefined(email) || isNotValidString(email) || isUndefined(password) || isNotValidString(password)) {
        logger.warn('欄位未填寫正確')
        res.status(400).json({
          status: 'failed',
          message: '欄位未填寫正確'
        })
        return
      }
      if (!passwordPattern.test(password)) {
        logger.warn('建立使用者錯誤: 密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字')
        res.status(401).json({
          status: 'failed',
          message: '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'
        })
        return
      }
      const User = require('../entities/User') // 加上
      const userRepository = dataSource.getRepository(User) // 傳入 Entity 物件
    
      const existingUser = await userRepository.findOne({
        where: { email }
      })
  
      if (existingUser) {
        logger.warn('建立使用者錯誤: Email 已被使用')
        res.status(409).json({
          status: 'failed',
          message: 'Email 已被使用'
        })
        return
      }
      const salt = await bcrypt.genSalt(10)
      const hashPassword = await bcrypt.hash(password, salt)
      const newUser = userRepository.create({
        name,
        email,
        role: 'USER',
        password: hashPassword
      })
      const savedUser = await userRepository.save(newUser)
      const token = await generateJWT(
        { id: savedUser.id, name: savedUser.name },
        config.get('jwt.secret'), // 從設定檔取出 JWT_SECRET
        { expiresIn: '1d' }
      )      
      logger.info('新建立的使用者ID:', savedUser.id)
      res.status(201).json({
        status: 'success',
        data: {
          user: {
            id: savedUser.id,
            name: savedUser.name,
            token
          }
        }
      })
    } catch (error) {
      logger.error('建立使用者錯誤:', error)
      next(error)
    }
}

async function postLogin (req, res, next) {
  try {
    const { email, password } = req.body
    if (isUndefined(email) || isNotValidString(email) || isUndefined(password) || isNotValidString(password)) {
      logger.warn('欄位未填寫正確')
      res.status(400).json({
        status: 'failed',
        message: '欄位未填寫正確'
      })
      return
    }
    if (!passwordPattern.test(password)) {
      logger.warn('密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字')
      res.status(400).json({
        status: 'failed',
        message: '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'
      })
      return
    }
    const userRepository = dataSource.getRepository('User')
    const existingUser = await userRepository.findOne({
      select: ['id', 'name', 'password', 'role'],
      where: { email }
    })

    if (!existingUser) {
      res.status(400).json({
        status: 'failed',
        message: '使用者不存在或密碼輸入錯誤'
      })
      return
    }
    logger.info(`使用者資料: ${JSON.stringify(existingUser)}`)
    const isMatch = await bcrypt.compare(password, existingUser.password)
    if (!isMatch) {
      res.status(400).json({
        status: 'failed',
        message: '使用者不存在或密碼輸入錯誤'
      })
      return
    }
    const token = await generateJWT({
      id: existingUser.id,
      role: existingUser.role
    }, config.get('secret.jwtSecret'), {
      expiresIn: `${config.get('secret.jwtExpiresDay')}` 
    })

    res.status(201).json({
      status: 'success',
      data: {
        token,
        user: { 
          name: existingUser.name
        }
      }
    })
  } catch (error) {
    logger.error('登入錯誤:', error)
    next(error)
  }
}

async function getProfile (req, res, next) {
  try {
    const { id } = req.user
    const userRepository = dataSource.getRepository('User')
    const user = await userRepository.findOne({
      select: ['name', 'email'],
      where: { id }
    })
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    })
  } catch (error) {
    logger.error('取得使用者資料錯誤:', error)
    next(error)
  }
}

module.exports = {
    postSignup,
    postLogin,
    getProfile 
}
  