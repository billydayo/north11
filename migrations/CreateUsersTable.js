module.exports = class CreateUserTable1715151234567 {
    async up(queryRunner) {
      await queryRunner.query(`
        CREATE TABLE "user" (
          "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          "name" VARCHAR(50) NOT NULL,
          "email" VARCHAR(320) NOT NULL UNIQUE,
          "role" VARCHAR(20) NOT NULL,
          "password" VARCHAR(72) NOT NULL,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now()
        );
      `);
    }
  
    async down(queryRunner) {
      await queryRunner.query(`DROP TABLE "user";`);
    }
  };