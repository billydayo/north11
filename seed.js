const { dataSource } = require('./db/data-source');
const Store = require('./entities/Store');
const generateStores = require('./generateStores'); // 匯入你剛寫的假資料函式

async function seed() {
  await dataSource.initialize();
  const storeRepo = dataSource.getRepository('Store');

  const stores = generateStores(10); // 產生 10 筆假資料
  await storeRepo.save(stores);      // 寫入資料庫

  console.log('✅ 成功插入 10 筆店家資料！');
  process.exit();
}

seed().catch((err) => {
  console.error('❌ 錯誤：', err);
  process.exit(1);
});
