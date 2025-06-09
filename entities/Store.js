const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
  name: 'Store',
  tableName: 'store',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid'
    },
    name: {
      type: 'varchar',
      length: 100,
      nullable: false
    },
    type: {
      type: 'json',
      nullable: false,
      comment: '店家類型，存儲為 JSON 陣列'
    },
    email: {
      type: 'varchar',
      length: 320,
      nullable: true
    },
    phone: {
      type: 'varchar',
      length: 20,
      nullable: true
    },
    description: {
      type: 'text',
      nullable: true
    },
    location: {
      type: 'json',
      nullable: false,
      comment: '位置資訊，包含 lat、lng 和 address'
    },
    businessHours: {
      type: 'json',
      nullable: true,
      comment: '營業時間，格式為 {mon: "10:00-21:00", tue: "10:00-21:00", wed: null, thu: null, fri: null, sat: null, sun: "公休"}'
    },
    status: {
      type: 'varchar',
      length: 20,
      nullable: false,
      default: 'active',
      comment: '店家狀態：active, inactive, suspended'
    },
    owner_id: {
      type: 'uuid',
      nullable: true,
      comment: '店家擁有者 ID，關聯到 User 表'
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
      nullable: false
    },
    updated_at: {
      type: 'timestamp',
      updateDate: true,
      nullable: false
    }
  },
  relations: {
    owner: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: {
        name: 'owner_id'
      }
    }
  },
  indices: [
    {
      name: 'IDX_STORE_NAME',
      columns: ['name']
    },
    {
      name: 'IDX_STORE_STATUS',
      columns: ['status']
    }
  ]
}) 