import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameTimestampColumns1740992965610 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn('posts', 'createdAt', 'created_at');
        await queryRunner.renameColumn('posts', 'updatedAt', 'updated_at');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn('posts', 'created_at', 'createdAt');
        await queryRunner.renameColumn('posts', 'updated_at', 'updatedAt');
    }

}
