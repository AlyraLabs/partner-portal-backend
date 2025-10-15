import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUserNames1736964130000 implements MigrationInterface {
  name = 'RemoveUserNames1736964130000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'firstName');
    await queryRunner.dropColumn('users', 'lastName');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // await queryRunner.addColumn('users', {
    //   name: 'firstName',
    //   type: 'varchar',
    //   length: '100',
    //   isNullable: false,
    //   default: "''",
    // }),
    // await queryRunner.addColumn('users', {
    //   name: 'lastName', 
    //   type: 'varchar',
    //   length: '100',
    //   isNullable: false,
    //   default: "''",
    // }),
  }
}
