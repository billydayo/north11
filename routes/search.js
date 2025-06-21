const express = require('express');
const { searchPlaces } = require('../services/placesService');

const router = express.Router();

router.get('/search', async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: '請提供搜尋關鍵字' });
  }

  try {
    const places = await searchPlaces(query);
    res.json({ status: 'success', data: places });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;