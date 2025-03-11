import { MigrationInterface, QueryRunner } from 'typeorm';

export class ComponentStyleConfig1741676875281 implements MigrationInterface {
  name = 'ComponentStyleConfig1741676875281';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "component_style_configs" (
        "id" SERIAL NOT NULL,
        "theme_id" integer NOT NULL,
        "type" character varying(50) NOT NULL,
        "title" character varying(255) NOT NULL,
        "settings" jsonb NOT NULL DEFAULT '{}',
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_component_style_configs_theme_id_type" UNIQUE ("theme_id", "type"),
        CONSTRAINT "PK_component_style_configs" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "component_style_configs" 
      ADD CONSTRAINT "FK_component_style_configs_themes" 
      FOREIGN KEY ("theme_id") 
      REFERENCES "themes"("id") 
      ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "component_style_configs" 
      DROP CONSTRAINT "FK_component_style_configs_themes"
    `);
    
    await queryRunner.query(`
      DROP TABLE "component_style_configs"
    `);
  }
} 