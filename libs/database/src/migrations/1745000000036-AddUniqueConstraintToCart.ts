import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueConstraintToCart1745000000036 implements MigrationInterface {
  name = 'AddUniqueConstraintToCart1745000000036';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, clean up any existing duplicate carts
    await queryRunner.query(`
      -- Keep only the newest cart for each session_id
      DELETE FROM carts 
      WHERE id NOT IN (
        SELECT DISTINCT ON (session_id) id 
        FROM carts 
        WHERE session_id IS NOT NULL 
        ORDER BY session_id, created_at DESC
      ) AND session_id IS NOT NULL
    `);

    // Keep only the newest cart for each user_id
    await queryRunner.query(`
      DELETE FROM carts 
      WHERE id NOT IN (
        SELECT DISTINCT ON (user_id) id 
        FROM carts 
        WHERE user_id IS NOT NULL 
        ORDER BY user_id, created_at DESC
      ) AND user_id IS NOT NULL
    `);

    // Add unique constraint for session_id (excluding NULL values)
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_carts_session_id_unique" 
      ON "carts" ("session_id") 
      WHERE "session_id" IS NOT NULL
    `);

    // Add unique constraint for user_id (excluding NULL values)
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_carts_user_id_unique" 
      ON "carts" ("user_id") 
      WHERE "user_id" IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the unique indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_carts_session_id_unique"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_carts_user_id_unique"`);
  }
} 