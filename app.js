const dotenv = require('dotenv');
const result = dotenv.config();
// 讓程式可讀取 .env
const express = require('express');
const secret = require('./config/secret');
const { dataSource } = require('./db/data-source'); 
const app = express();
app.use(express.json())

const user = require('./routes/user')
app.use('/api/users',user)

const port = process.env.PORT || 8000;

dataSource.initialize()
  .then(() => {
    console.log('資料庫連線成功');
    app.listen(port, () => {
      console.log(`伺服器已啟動`);
    });
  })
  .catch((err) => {
    console.error('資料庫連線失敗', err);
  });

//module.exports = app