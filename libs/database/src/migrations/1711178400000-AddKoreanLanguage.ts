import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddKoreanLanguage1711178400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO languages (code, name, native_name, flag_code, is_active, is_default)
      VALUES ('ko', 'Korean', '한국어', 'KR', true, false)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM languages WHERE code = 'ko'
    `);
  }
} 