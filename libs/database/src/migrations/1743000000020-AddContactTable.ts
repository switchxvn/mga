import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContactTable1743000000020 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "contacts" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "email" character varying(255) NOT NULL,
                "phone" character varying(20) NOT NULL,
                "message" text NOT NULL,
                "status" character varying(20) NOT NULL DEFAULT 'pending',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_contacts" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "contacts"`);
    }
} 