const { MigrationInterface, QueryRunner } = require('typeorm');

class CreateStoreTable1749135776158 {
  name = 'CreateStoreTable1749135776158';

  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE "store" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "type" json NOT NULL,
        "email" character varying(320),
        "phone" character varying(20),
        "description" text,
        "location" json NOT NULL,
        "businessHours" json,
        "status" character varying(20) NOT NULL DEFAULT 'active',
        "owner_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_store" PRIMARY KEY ("id"),
        CONSTRAINT "FK_store_user" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE SET NULL
      )
    `);

    // 創建索引
    await queryRunner.query(`CREATE INDEX "IDX_STORE_NAME" ON "store" ("name")`);
    await queryRunner.query(`CREATE INDEX "IDX_STORE_STATUS" ON "store" ("status")`);
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP INDEX "IDX_STORE_STATUS"`);
    await queryRunner.query(`DROP INDEX "IDX_STORE_NAME"`);
    await queryRunner.query(`DROP TABLE "store"`);
  }
}

module.exports = CreateStoreTable1749135776158; 