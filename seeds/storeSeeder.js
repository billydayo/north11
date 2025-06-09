const { dataSource } = require('../db/data-source')
const Store = require('../entities/Store')

const storeData = [
  {
    name: "Starbucks（微風台北車站門市）",
    type: ["連鎖", "咖啡"],
    email: "",
    phone: "02-2552-7432",
    description: "位於京站1樓／B１，提供各式星巴克飲品與輕食，環境舒適。",
    location: {
      lat: 25.0480,
      lng: 121.5179,
      address: "台北市大同區承德路一段1號（京站時尚廣場1樓／B1）"
    },
    businessHours: {
      mon: "07:00-22:00",
      tue: "07:00-22:00",
      wed: "07:00-22:00",
      thu: "07:00-22:00",
      fri: "07:00-22:00",
      sat: "07:00-22:00",
      sun: "07:00-22:00"
    }
  },
  {
    name: "Starbucks（台鐵一門市 / 微風2樓）",
    type: ["連鎖", "咖啡"],
    email: "",
    phone: "02-2331-8012",
    description: "位於台北火車站2樓，提供行動預點、內用與外帶服務。",
    location: {
      lat: 25.0470,
      lng: 121.5176,
      address: "台北市中正區北平西路3號2樓（台北車站）"
    },
    businessHours: {
      mon: "07:00-22:00",
      tue: "07:00-22:00",
      wed: "07:00-22:00",
      thu: "07:00-22:00",
      fri: "07:00-22:00",
      sat: "07:00-22:00",
      sun: "07:00-22:00"
    }
  },
  {
    name: "Block & Cafe.（町咖啡）",
    type: ["文青", "不限時"],
    email: "",
    phone: "",
    description: "不限時、可帶電腦、提供插座與Wi‑Fi，適合工作／讀書。",
    location: {
      lat: 25.0490,
      lng: 121.5155,
      address: "台北市大同區太原路50號2樓"
    },
    businessHours: {
      mon: "12:00-22:00",
      tue: "12:00-22:00",
      wed: "12:00-22:00",
      thu: "12:00-22:00",
      fri: "12:00-22:00",
      sat: "12:00-22:00",
      sun: "12:00-22:00"
    }
  },
  {
    name: "言文字 Emoji Cafe & Bar",
    type: ["咖啡", "休閒"],
    email: "",
    phone: "",
    description: "提供時段制／不限時方案，空間舒適、飲品選擇多。",
    location: {
      lat: 25.0465,
      lng: 121.5170,
      address: "台北市中正區開封街一段6號"
    },
    businessHours: {
      mon: "11:00-21:00",
      tue: "11:00-21:00",
      wed: "11:00-21:00",
      thu: "11:00-21:00",
      fri: "11:00-21:00",
      sat: "11:00-21:00",
      sun: "公休"
    }
  },
  {
    name: "光生咖啡 MITSUO",
    type: ["文青", "老宅風"],
    email: "",
    phone: "",
    description: "巷弄老宅改建，大片玻璃窗、有工業風格氛圍。",
    location: {
      lat: 25.0500,
      lng: 121.5150,
      address: "台北市大同區太原路11巷20號"
    },
    businessHours: {
      mon: "13:00-21:00",
      tue: "13:00-21:00",
      wed: "13:00-21:00",
      thu: "13:00-21:00",
      fri: "13:00-21:00",
      sat: "13:00-21:00",
      sun: "公休"
    }
  }
]

async function seedStores() {
  try {
    const storeRepository = dataSource.getRepository(Store)
    
    // 檢查是否已有資料
    const existingStores = await storeRepository.find()
    if (existingStores.length > 0) {
      console.log('店家資料已存在，跳過種子資料插入')
      return
    }

    // 插入新資料
    for (const store of storeData) {
      const newStore = storeRepository.create({
        ...store,
        status: 'active'
      })
      await storeRepository.save(newStore)
    }

    console.log('成功插入店家種子資料')
  } catch (error) {
    console.error('插入店家種子資料時發生錯誤：', error)
    throw error
  }
}

module.exports = seedStores 