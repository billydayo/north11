module.exports = class CreateFavoriteTable1750243236191 {
    name = 'CreateFavoriteTable1750243236191';

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "store" DROP CONSTRAINT "FK_store_user"`);
        await queryRunner.query(`CREATE TABLE "favorite" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, "favorite_user_id" uuid, CONSTRAINT "PK_495675cec4fb09666704e4f610f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`COMMENT ON COLUMN "store"."type" IS '店家類型，存儲為 JSON 陣列'`);
        await queryRunner.query(`COMMENT ON COLUMN "store"."location" IS '位置資訊，包含 lat、lng 和 address'`);
        await queryRunner.query(`COMMENT ON COLUMN "store"."businessHours" IS '營業時間，格式為 {mon: "10:00-21:00", tue: "10:00-21:00", wed: null, thu: null, fri: null, sat: null, sun: "公休"}'`);
        await queryRunner.query(`COMMENT ON COLUMN "store"."status" IS '店家狀態：active, inactive, suspended'`);
        await queryRunner.query(`COMMENT ON COLUMN "store"."owner_id" IS '店家擁有者 ID，關聯到 User 表'`);
        await queryRunner.query(`ALTER TABLE "store" ADD CONSTRAINT "FK_8ce7c0371b6fca43a17f523ce44" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorite" ADD CONSTRAINT "FK_e666fc7cc4c80fba1944daa1a74" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorite" ADD CONSTRAINT "FK_8e56e6b163cc379bc1ea44c49e7" FOREIGN KEY ("favorite_user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "favorite" DROP CONSTRAINT "FK_8e56e6b163cc379bc1ea44c49e7"`);
        await queryRunner.query(`ALTER TABLE "favorite" DROP CONSTRAINT "FK_e666fc7cc4c80fba1944daa1a74"`);
        await queryRunner.query(`ALTER TABLE "store" DROP CONSTRAINT "FK_8ce7c0371b6fca43a17f523ce44"`);
        await queryRunner.query(`COMMENT ON COLUMN "store"."owner_id" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "store"."status" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "store"."businessHours" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "store"."location" IS NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "store"."type" IS NULL`);
        await queryRunner.query(`DROP TABLE "favorite"`);
        await queryRunner.query(`ALTER TABLE "store" ADD CONSTRAINT "FK_store_user" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }
};
