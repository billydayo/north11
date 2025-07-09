const bcrypt = require('bcrypt');
const { IsNull, In } = require('typeorm');
const config = require('../config/index');
const logger = require('../utils/logger')('UsersController');
const generateJWT = require('../utils/generateJWT');
const { dataSource } = require('../db/data-source')
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const Store = require('../entities/Store');
const nodemailer = require('nodemailer');
const { sendResetPasswordEmail } = require('../utils/email');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const jwt = require('jsonwebtoken');
const { networkInterfaces } = require('os');
//const { jwt } = require('../config'); 
const jwtSecret = process.env.JWT_SECRET; 

const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/
//圖片相關
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const isValidMime = filetypes.test(file.mimetype);
    const isValidExt = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (isValidMime && isValidExt) {
      cb(null, true);
    } else {
      cb(new Error('只允許上傳圖片檔案'));
    }
  },
}).single('image');

function isUndefined (value) {
    return value === undefined
}
function isNotValidString (value) {
    return typeof value !== 'string' || value.trim().length === 0;
}
function isNotValidPhoneNumber(phone){
  const phoneRegex = /^09\d{8}$/; // 台灣手機號碼格式
  return !phoneRegex.test(phone);
}
function roleisdefined(value){
  return value == "user" || value == "store";
}
async function postSignup (req, res, next) {
    try {
      const { name, email, password, role } = req.body
      if (isUndefined(name) || isNotValidString(name) || isUndefined(email) || isNotValidString(email) || 
      isUndefined(password) || isNotValidString(password) || isUndefined(role)|| isNotValidString(role) || !roleisdefined(role) ) {
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
        role, 
        password: hashPassword
      })
      const savedUser = await userRepository.save(newUser)
      const token = await generateJWT(
        { id: savedUser.id, name: savedUser.name },
        config.get('secret.jwtSecret'), // 從設定檔取出 JWT_SECRET
        { expiresIn: '1d' }
      )      
      logger.info('新建立的使用者ID:', savedUser.id)
      res.status(201).json({
        status: 'success',
        data: {
          user: {
            id: savedUser.id,
            name: savedUser.name,
            role: savedUser.role,
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
      res.status(401).json({
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
      res.status(402).json({
        status: 'failed',
        message: '使用者不存在或密碼輸入錯誤'
      })
      return
    }
    logger.info(`使用者資料: ${JSON.stringify(existingUser)}`)
    const isMatch = await bcrypt.compare(password, existingUser.password)
    if (!isMatch) {
      res.status(402).json({
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

    res.status(200).json({
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
      select: ['name', 'email', 'phonenumber', 'region','id','role'],
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

async function putPassword (req, res, next) {
  try {
    const { id } = req.user
    const { password, new_password: newPassword, confirm_new_password: confirmNewPassword } = req.body
    if (isUndefined(password) || isNotValidString(password) ||
    isUndefined(newPassword) || isNotValidString(newPassword) ||
    isUndefined(confirmNewPassword) || isNotValidString(confirmNewPassword)) {
      logger.warn('欄位未填寫正確')
      res.status(400).json({
        status: 'failed',
        message: '欄位未填寫正確'
      })
      return
    }
    if (!passwordPattern.test(password) || !passwordPattern.test(newPassword) || !passwordPattern.test(confirmNewPassword)) {
      logger.warn('密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字')
      res.status(401).json({
        status: 'failed',
        message: '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'
      })
      return
    }
    if (newPassword === password) {
      logger.warn('新密碼不能與舊密碼相同')
      res.status(402).json({
        status: 'failed',
        message: '新密碼不能與舊密碼相同'
      })
      return
    }
    if (newPassword !== confirmNewPassword) {
      logger.warn('新密碼與驗證新密碼不一致')
      res.status(403).json({
        status: 'failed',
        message: '新密碼與驗證新密碼不一致'
      })
      return
    }
    const userRepository = dataSource.getRepository('User')
    const existingUser = await userRepository.findOne({
      select: ['password'],
      where: { id }
    })
    const isMatch = await bcrypt.compare(password, existingUser.password)
    if (!isMatch) {
      res.status(404).json({
        status: 'failed',
        message: '密碼輸入錯誤'
      })
      return
    }
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(newPassword, salt)
    const updatedResult = await userRepository.update({
      id
    }, {
      password: hashPassword
    })
    if (updatedResult.affected === 0) {
      res.status(405).json({
        status: 'failed',
        message: '更新密碼失敗'
      })
      return
    }
    res.status(200).json({
      status: 'success',
      data: null
    })
  } catch (error) {
    logger.error('更新密碼錯誤:', error)
    next(error)
  }
}

async function checkLoginStatus(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(200).json({ isLoggedIn: false });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.get('secret.jwtSecret'));

    return res.status(200).json({ isLoggedIn: true });
  } catch (error) {
    return res.status(400).json({ isLoggedIn: false });
  }
}

async function putProfile (req, res, next) {
  try {
    const { id } = req.user
    const { name } = req.body
    if (isUndefined(name) || isNotValidString(name)) {
      logger.warn('欄位未填寫正確')
      res.status(400).json({
        status: 'failed',
        message: '欄位未填寫正確'
      })
      return
    }
    const userRepository = dataSource.getRepository('User')
    const user = await userRepository.findOne({
      select: ['name'],
      where: {
        id
      }
    })
    if (user.name === name) {
      res.status(400).json({
        status: 'failed',
        message: '使用者名稱未變更'
      })
      return
    }
    const updatedResult = await userRepository.update({
      id,
      name: user.name
    }, {
      name
    })
    if (updatedResult.affected === 0) {
      res.status(400).json({
        status: 'failed',
        message: '更新使用者資料失敗'
      })
      return
    }
    const result = await userRepository.findOne({
      select: ['name'],
      where: {
        id
      }
    })
    res.status(200).json({
      status: 'success',
      data: {
        user: result
      }
    })
  } catch (error) {
    logger.error('取得使用者資料錯誤:', error)
    next(error)
  }
}

async function updateUser (req, res, next) {
    try {
    const { id } = req.user
    const { name } = req.body
    const { region } = req.body
    const { phonenumber } = req.body
    
    if (
      isUndefined(name) || isNotValidString(name) ||
      isUndefined(region) ||
      isUndefined(phonenumber) || isNotValidPhoneNumber(phonenumber)
    ) {
      logger.warn('欄位格式錯誤');
      return res.status(400).json({
        status: 'failed',
        message: '請確認欄位格式是否正確（名稱、region、電話）'
      });
    }

    const userRepository = dataSource.getRepository('User')
    const user = await userRepository.findOne({
      select: ['name', 'region', 'phonenumber'],
      where: { id }
    })
    if (!user) {
      res.status(404).json({
        status: 'failed',
        message: '找不到使用者'
      });
      return;
    }
    if (
      user.name === name &&
      user.region === region &&
      user.phonenumber === phonenumber
    ) {
      return res.status(400).json({
        status: 'failed',
        message: '使用者資料未變更'
      });
    }

    const updatedResult = await userRepository.update({ id }, {
      name,
      region,
      phonenumber
    });

    if (updatedResult.affected === 0) {
      res.status(400).json({
        status: 'failed',
        message: '更新使用者資料失敗'
      })
      return
    }
    const result = await userRepository.findOne({
      select: ['name', 'region', 'phonenumber'],
      where: {
        id
      }
    })
    res.status(200).json({
      status: 'success',
      data: {
        user: result
      }
    })
  } catch (error) {
    logger.error('更新使用者資料錯誤:', error)
    next(error)
  }
}

async function getStores(req, res) {
  try {
    const Store = require('../entities/Store')
    const storeRepository = dataSource.getRepository(Store)
    const stores = await storeRepository.find()

    // 轉換資料格式
    const formattedStores = stores.map(store => ({
      id: store.id,
      name: store.name,
      location: store.location.address,
      price: "200~400", 
      type: store.type,
      email: store.email,
      phone: store.phone,
      rating: 4.5 // 根據實際需求修改或從資料庫獲取
    }))

    return res.status(200).json({
      status: "success",
      message: "搜尋成功",
      data: formattedStores
    })
  } catch (error) {
    logger.error('獲取餐廳列表時發生錯誤：', error)
    return res.status(500).json({
      status: "error",
      message: "獲取餐廳列表失敗",
      error: error.message
    })
  }
}
/*
async function upload(req, res) {
  const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
  });

  const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 最大5MB
  fileFilter(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const isValidMime = filetypes.test(file.mimetype);
    const isValidExt = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (isValidMime && isValidExt) {
      cb(null, true);
    } else {
      cb(new Error('只允許上傳圖片檔案'));
    }
  },
  }).single('image');

  return new Promise((resolve) => {
    uploadMiddleware(req, res, async(err) => {
      if (err) {
        return resolve(res.status(400).json({ error: err.message }));
      }
      if (!req.file) {
        return resolve(res.status(400).json({ error: '請上傳圖片檔案' }));
      }
      
      const imagePath = req.file.path;  // 存相對路徑

      try {
        const imageRepo = dataSource.getRepository(Store);
        const newImage = imageRepo.create({ path: imagePath });
        await imageRepo.save(newImage);

        return resolve(res.json({
          status: 'success',
          filename: req.file.filename,
          path: imagePath,
          dbId: newImage.id,  // 回傳資料庫ID
        }));
      } catch (dbError) {
        console.error(dbError);
        return resolve(res.status(500).json({ error: '資料庫錯誤' }));
      }
    });
  });
}
*/
async function upload(req, res) {
  try {
    await uploadFile(req, res); // multer Promise 包裝

    if (!req.file) {
      return res.status(400).json({ error: '請上傳圖片檔案' });
    }

    const imagePath = req.file.path;
    const storeRepo = dataSource.getRepository(Store);

    // 用 owner_id 找 Store
    const store = await storeRepo.findOneBy({ owner_id: req.user.id});
    if (!store) {
      return res.status(404).json({ error: '找不到對應的商店資料' });
    }

    if (!store.images) store.images = [];
    store.images.push(imagePath);

    await storeRepo.save(store);

    return res.json({
      status: 'success',
      filename: req.file.filename,
      path: imagePath,
      storeId: store.id,
      images: store.images,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
}
function uploadFile(req, res) {
  return new Promise((resolve, reject) => {
    uploadMiddleware(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

async function deleteImage(req, res) {
  try {
    const userId = req.user.id; // 從登入的使用者取 ID
    const imageToDelete = req.body.imagePath; // 前端傳要刪的圖片路徑

    if (!imageToDelete) {
      return res.status(400).json({ error: '請提供要刪除的圖片路徑' });
    }

    const storeRepo = dataSource.getRepository(Store);
    const store = await storeRepo.findOneBy({ owner_id: userId });

    if (!store) {
      return res.status(404).json({ error: '找不到商店資料' });
    }

    // 檢查圖片是否存在於 store.images 中
    const imageIndex = store.images.indexOf(imageToDelete);
    if (imageIndex === -1) {
      return res.status(404).json({ error: '圖片不存在於商店資料中' });
    }

    // 刪除硬碟圖片
    const uploadsDir = path.resolve('uploads');
    const fullPath = path.resolve(uploadsDir, path.basename(imageToDelete));
    try {
      await fs.unlink(fullPath);
    } catch (fsErr) {
      console.error('刪除檔案失敗:', fsErr);
    }
    // 從資料庫移除圖片路徑
    store.images.splice(imageIndex, 1);
    await storeRepo.save(store);

    return res.json({ status: 'success', message: '圖片已刪除' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
}

async function forget(req, res, next) {
  try {
    const { email } = req.body;
    const userRepository = dataSource.getRepository('User');
    const user = await userRepository.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ status: 'failed', message: '找不到該使用者' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // 你的 Gmail
        pass: process.env.EMAIL_PASS, // Gmail App Password（不是登入密碼）
      },
    });

    await transporter.sendMail({
      from: `"north11map@gmail.com" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '重設密碼',
      html: `
        <p>請點擊以下連結重設密碼（15 分鐘內有效）：</p>
        <a href="https://food-map-project-frontend.onrender.com/reset?token=${token}">重設密碼連結</a>
      `,
    });

    res.json({ status: 'success', message: '重設密碼信已寄出' });
  } catch (error) {
      next(error);
  }
}

async function reset(req, res, next) {
   try {
    const { token, newPassword } = req.body;

    if (!newPassword || isUndefined(newPassword) || isNotValidString(newPassword)) {
      logger.warn('密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字');
      res.status(401).json({
        status: 'failed',
        message: '密碼不符合規則，需要包含英文數字大小寫，最短8個字，最長16個字'
      })
      return
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userRepository = dataSource.getRepository('User');
    const user = await userRepository.findOneBy({ id: payload.id });

    if (!user) {
      return res.status(404).json({ status: 'failed', message: '使用者不存在' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await userRepository.save(user);

    res.json({ status: 'success', message: '密碼已更新' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 'failed', message: '重設連結已過期' });
    }
    next(error);
  }
}

async function getUserStore(req, res) {
  try {
    const ownerId = req.user.id;
    const storeRepo = dataSource.getRepository('Store');
    const stores = await storeRepo.findBy({ owner_id: ownerId });

    return res.json({ status: 'success', data: stores });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
}

async function postUserStore(req, res) {
  try {
    const userId = req.user.id;
    const { name, type, email, phone, description, businessHours, status, images} = req.body;  // 接收前端傳來的欄位（可擴充）

    const storeRepo = dataSource.getRepository('Store');
    const store = await storeRepo.findOneBy({ owner_id: userId });

    if (!store) {
      return res.status(404).json({ error: '找不到商店資料' });
    }
    //只更新有寫的欄位
    if (name !== undefined) store.name = name;
    if (type !== undefined) store.type = type;
    if (email !== undefined) store.email = email;
    if (phone !== undefined) store.phone = phone;
    if (description !== undefined) store.description = description;
    if (businessHours !== undefined) store.businessHours = businessHours;
    if (status !== undefined) store.status = status;
    if (images !== undefined) store.images = images;

    await storeRepo.save(store);

    return res.json({ status: 'success', data: store });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
}

module.exports = {
    postSignup,
    postLogin,
    getStores,
    getProfile,
    putPassword,
    checkLoginStatus,
    putProfile,
    updateUser,
    upload,
    deleteImage,
    forget,
    reset,
    getUserStore,
    postUserStore
}