const fs = require('fs');
const path = require('path');

function ensureUploadDir() {
  const uploadDir = path.join(__dirname, '..', 'uploads'); // 調整路徑到專案根目錄
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('✅ uploads 資料夾已自動建立');
  } else {
    console.log('✅ uploads 資料夾已存在');
  }
}

module.exports = ensureUploadDir;
