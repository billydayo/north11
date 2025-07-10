const express = require('express');
const router = express.Router();
const { dataSource } = require('../db/data-source');
//新搜尋
router.get('/search', async (req, res) => {
  const { q, limit = 10, offset = 0 } = req.query;

  if (!q) {
    return res.status(400).json({ error: '請提供搜尋關鍵字 q' });
  }

  try {
    const storeRepo = dataSource.getRepository('Store');
    const stores = await storeRepo
      .createQueryBuilder('store')
      .where('store.name ILIKE :keyword OR store.location::jsonb ->> \'address\' ILIKE :keyword', {
        keyword: `%${q}%`,
      })
      .take(Number(limit))
      .skip(Number(offset))
      .orderBy('store.created_at', 'DESC')
      .getMany();

    res.json({ status: 'success', data: stores });
  } catch (error) {
    console.error('搜尋錯誤:', error);
    res.status(500).json({ status: 'error', message: '搜尋失敗' });
  }
});

module.exports = router;
