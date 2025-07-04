const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
  name: 'User',
  tableName: 'user',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid'
    },
    name: {
      type: 'varchar',
      length: 50,
      nullable: false
    },
    email: {
      type: 'varchar',
      length: 320,
      nullable: false,
      unique: true
    },
    role: {
      type: 'varchar',
      length: 20,
      nullable: false
    },
    password: {
      type: 'varchar',
      length: 72,
      nullable: false,
      select: false
    },
    phonenumber: {
      type: 'varchar',
      length: 10,
      nullable: true,
    },
    region: {
      type: 'varchar',
      length: 50,
      nullable: true,
    },
    reset_password_token: {
      type: 'varchar',
      nullable: true,
    },
    reset_password_expires: {
      type: 'timestamp',
      nullable: true,
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
  }
})
