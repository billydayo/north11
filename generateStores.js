const { Faker, zh_TW, en } = require('@faker-js/faker');
const { v4: uuidv4 } = require('uuid');

// 使用 zh_TW 為主，en 為補充語系
const faker = new Faker({ locale: [zh_TW, en] });

const statusOptions = ['active', 'inactive', 'suspended'];

const businessHoursTemplate = {
  mon: '11:00-21:00',
  tue: '11:00-21:00',
  wed: '11:00-21:00',
  thu: '11:00-21:00',
  fri: '11:00-22:00',
  sat: '10:00-22:00',
  sun: '休息'
};

function generateStore() {
  const lat = +(22.5 + Math.random() * 3).toFixed(6); // 台灣大致緯度範圍
  const lng = +(120 + Math.random() * 2).toFixed(6);  // 台灣大致經度範圍

  return {
    id: uuidv4(),
    name: `${faker.person.lastName()}鐵板燒`,
    type: ['restaurant', 'teppanyaki'],
    email: faker.internet.email(),
    phone: faker.phone.number('09########'),
    description: '高品質鐵板燒料理，含有創新與特殊風味。',
    location: {
      lat,
      lng,
      address: faker.location.streetAddress(true)
    },
    businessHours: businessHoursTemplate,
    status: faker.helpers.arrayElement(statusOptions),
    owner_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

// 產生 10 筆資料
const stores = Array.from({ length: 10 }, generateStore);

// 印出結果
console.log(JSON.stringify(stores, null, 2));

function generateStores(count = 10) {
  return Array.from({ length: count }, generateStore);
}

module.exports = generateStore;