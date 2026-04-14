import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitActivityChunk1713110400000 implements MigrationInterface {
  name = 'InitActivityChunk1713110400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.query(`
      CREATE TABLE "activity_chunk" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "startedAt" TIMESTAMP NOT NULL,
        "endedAt" TIMESTAMP NOT NULL,
        "duration" integer NOT NULL,
        "appName" character varying NOT NULL,
        "appUrl" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_activity_chunk_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "activity_chunk"
      ADD CONSTRAINT "UQ_activity_chunk_started_at_app_name_app_url"
      UNIQUE ("startedAt", "appName", "appUrl")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "activity_chunk"
      DROP CONSTRAINT "UQ_activity_chunk_started_at_app_name_app_url"
    `);

    await queryRunner.query('DROP TABLE "activity_chunk"');
  }
}
