const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Favorite',
    tableName: 'favorite',
    columns: {
        id: {
            primary: true,
            type: 'uuid',
            generated: 'uuid'
        },
        created_at: {
            type: 'timestamp',
            createDate: true
        }
    },
    relations: {
        user: {
            type: 'many-to-one',
            target: 'User',
            joinColumn: true,
            onDelete: 'CASCADE'
        },
        store: {
            type: 'many-to-one',
            target: 'Store',
            joinColumn: true,
            onDelete: 'CASCADE'
        }
    }
})