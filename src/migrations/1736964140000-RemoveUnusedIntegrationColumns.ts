import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUnusedIntegrationColumns1736964140000
  implements MigrationInterface
{
  name = 'RemoveUnusedIntegrationColumns1736964140000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop unique constraint on uniqueString first
    await queryRunner.query(
      `ALTER TABLE "integrations" DROP CONSTRAINT IF EXISTS "UQ_integrations_uniqueString"`,
    );

    // Drop the unused columns
    await queryRunner.dropColumn('integrations', 'name');
    await queryRunner.dropColumn('integrations', 'url');
    await queryRunner.dropColumn('integrations', 'uniqueString');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Re-add the columns in reverse order
    await queryRunner.query(
      `ALTER TABLE "integrations" ADD COLUMN "name" varchar(100) NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "integrations" ADD COLUMN "url" varchar(500)`,
    );
    await queryRunner.query(
      `ALTER TABLE "integrations" ADD COLUMN "uniqueString" varchar(255) NOT NULL DEFAULT ''`,
    );

    // Re-add unique constraint on uniqueString
    await queryRunner.query(
      `ALTER TABLE "integrations" ADD CONSTRAINT "UQ_integrations_uniqueString" UNIQUE ("uniqueString")`,
    );
  }
}
