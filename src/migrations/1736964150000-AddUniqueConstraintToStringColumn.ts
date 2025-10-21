import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueConstraintToStringColumn1736964150000
  implements MigrationInterface
{
  name = 'AddUniqueConstraintToStringColumn1736964150000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if the string column exists
    const table = await queryRunner.getTable('integrations');
    const stringColumn = table?.columns.find(
      (column) => column.name === 'string',
    );

    if (!stringColumn) {
      // If string column doesn't exist, add it
      await queryRunner.query(
        `ALTER TABLE "integrations" ADD COLUMN "string" varchar(255) NOT NULL DEFAULT ''`,
      );
    }

    // Add unique constraint to the string column
    await queryRunner.query(
      `ALTER TABLE "integrations" ADD CONSTRAINT "UQ_integrations_string" UNIQUE ("string")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the unique constraint
    await queryRunner.query(
      `ALTER TABLE "integrations" DROP CONSTRAINT IF EXISTS "UQ_integrations_string"`,
    );
  }
}
