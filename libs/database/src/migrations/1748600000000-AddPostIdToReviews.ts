import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPostIdToReviews1748600000000 implements MigrationInterface {
  name = 'AddPostIdToReviews1748600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "reviews"
      ADD COLUMN "post_id" integer NULL
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_reviews_post_id" ON "reviews" ("post_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "reviews"
      ADD CONSTRAINT "FK_reviews_post_id_posts"
      FOREIGN KEY ("post_id") REFERENCES "posts"("id")
      ON DELETE SET NULL
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "reviews"
      DROP CONSTRAINT "FK_reviews_post_id_posts"
    `);

    await queryRunner.query(`
      DROP INDEX "public"."IDX_reviews_post_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "reviews"
      DROP COLUMN "post_id"
    `);
  }
}
