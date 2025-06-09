require('dotenv').config();
const { dataSource } = require('../db/data-source');
const seedStores = require('../seeds/storeSeeder');

async function runSeeds() {
  try {
    await dataSource.initialize();
    console.log('資料庫連線成功');
    
    await seedStores();
    
    console.log('種子資料執行完成');
    process.exit(0);
  } catch (error) {
    console.error('執行種子資料時發生錯誤：', error);
    process.exit(1);
  }
}

runSeeds(); 