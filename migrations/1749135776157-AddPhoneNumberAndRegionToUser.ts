import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddPhoneNumberAndRegionToUser1749135776157 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            "user",
            new TableColumn({
                name: "phonenumber",
                type: "varchar",
                length: "10",
                isNullable: true,
            })
        );

        await queryRunner.addColumn(
            "user",
            new TableColumn({
                name: "region",
                type: "varchar",
                length: "50",
                isNullable: true,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("user", "region");
        await queryRunner.dropColumn("user", "phonenumber");
    }

}