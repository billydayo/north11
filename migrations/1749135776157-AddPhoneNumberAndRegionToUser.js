const { TableColumn } = require("typeorm");

module.exports = class AddPhoneNumberAndRegionToUser1749135776157 {
  name = "AddPhoneNumberAndRegionToUser1749135776157";

  async up(queryRunner) {
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

  async down(queryRunner) {
    await queryRunner.dropColumn("user", "region");
    await queryRunner.dropColumn("user", "phonenumber");
  }
};