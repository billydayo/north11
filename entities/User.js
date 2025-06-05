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
      type: 'int',
      length: 10,
      nullable: true,
    },
    region: {
      type: 'varchar',
      length: 50,
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
