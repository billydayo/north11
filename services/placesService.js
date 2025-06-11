const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.GOOGLE_API_KEY;
const baseURL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';

async function searchPlaces(query) {
  try {
    const response = await axios.get(baseURL, {
      params: {
        query,
        key: apiKey,
      },
    });
    return response.data.results;
  } catch (error) {
    console.error('搜尋錯誤:', error.message);
    throw new Error('無法取得地點資訊');
  }
}

module.exports = { searchPlaces };