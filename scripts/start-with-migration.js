const { exec } = require('child_process');

exec('npm run migration:run', (err, stdout, stderr) => {
  if (err) {
    console.error(' Migration 啟動失敗:', stderr);
    process.exit(1); // 停止啟動
  } else {
    console.log(' Migration 啟動成功:', stdout);
    require('../app'); // 啟動應用程式
  }
});