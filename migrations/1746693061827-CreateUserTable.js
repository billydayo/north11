const { MigrationInterface, QueryRunner } = require('typeorm');

class CreateUserTable1746693061827 {
  name = 'CreateUserTable1746693061827';

  async up(queryRunner) {
    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(50) NOT NULL,
        "email" character varying(320) NOT NULL,
        "role" character varying(20) NOT NULL,
        "password" character varying(72) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
        CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
      )
    `);
  }

  async down(queryRunner) {
    await queryRunner.query(`DROP TABLE "user"`);
  }
}

module.exports = CreateUserTable1746693061827;