const dotenv = require('dotenv');
const result = dotenv.config();
// 讓程式可讀取 .env
const express = require('express');
const secret = require('./config/secret');
const { dataSource } = require('./db/data-source'); 
const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors({
  origin: 'https://food-map-project-frontend.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

const user = require('./routes/user')
const searchs = require('./routes/service')

app.use('/api/users', user)
app.use('/api/search', searchs)

const port = process.env.PORT || 8000;

dataSource.initialize()
  .then(async () => {
    console.log('資料庫連線成功');
    await dataSource.runMigrations();
    console.log('Migration 執行完畢');
    app.listen(port, () => {
      console.log(`伺服器已啟動`);
    });
  })
  .catch((err) => {
    console.error('資料庫連線失敗', err);
  });

//module.exports = app