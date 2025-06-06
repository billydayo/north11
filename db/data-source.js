require('dotenv').config();
const { DataSource } = require('typeorm')
const config = require('../config/index')
const User = require('../entities/User')

const isProduction = process.env.NODE_ENV === 'production';

migrations: ['../migrations/*.js']
/** 
const dataSource = new DataSource({
  type: 'postgres',
  host: config.get('db.host'),
  port: config.get('db.port'),
  username: config.get('db.username'),
  password: config.get('db.password'),
  database: config.get('db.database'),
  synchronize: config.get('db.synchronize'),
  
  poolSize: 10,
  entities: [
    User
  ],
  ssl: config.get('db.ssl')
})
*/

let dataSourceOptions = {
  type: 'postgres',
  entities: [User],
  migrations: [__dirname + '/../migrations/*.js'],
  synchronize: false, //用true會跟migration衝突
  extra: {
    max: 10, // connection pool size
  },
};

// 如果是在Render，使用 DATABASE_URL + SSL
if (process.env.DATABASE_URL) {
  dataSourceOptions = {
    ...dataSourceOptions,
    url: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // Render 的自簽 SSL 憑證需要這個
    },
  };
} else {
  // 如果是在本地開發，使用分離設定值
  dataSourceOptions = {
    ...dataSourceOptions,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  };
}
const dataSource = new DataSource(dataSourceOptions);

module.exports = { dataSource }
