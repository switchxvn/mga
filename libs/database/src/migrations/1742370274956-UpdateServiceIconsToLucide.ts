import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateServiceIconsToLucide1742370274956 implements MigrationInterface {
    name = 'UpdateServiceIconsToLucide1742370274956'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update icons to use Lucide format
        await queryRunner.query(`
            UPDATE "services" 
            SET icon = 'forklift' 
            WHERE icon = 'mdi:forklift'
        `);
        
        await queryRunner.query(`
            UPDATE "services" 
            SET icon = 'truck' 
            WHERE icon = 'mdi:truck-delivery'
        `);
        
        await queryRunner.query(`
            UPDATE "services" 
            SET icon = 'wrench' 
            WHERE icon = 'mdi:tools'
        `);
        
        await queryRunner.query(`
            UPDATE "services" 
            SET icon = 'settings' 
            WHERE icon = 'mdi:cog-transfer'
        `);
        
        await queryRunner.query(`
            UPDATE "services" 
            SET icon = 'hard-hat' 
            WHERE icon = 'mdi:account-hard-hat'
        `);

        await queryRunner.query(`
            UPDATE "services" 
            SET icon = 'handshake' 
            WHERE icon = 'mdi:handshake'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert icons back to MDI format
        await queryRunner.query(`
            UPDATE "services" 
            SET icon = 'mdi:forklift' 
            WHERE icon = 'forklift'
        `);
        
        await queryRunner.query(`
            UPDATE "services" 
            SET icon = 'mdi:truck-delivery' 
            WHERE icon = 'truck'
        `);
        
        await queryRunner.query(`
            UPDATE "services" 
            SET icon = 'mdi:tools' 
            WHERE icon = 'wrench'
        `);
        
        await queryRunner.query(`
            UPDATE "services" 
            SET icon = 'mdi:cog-transfer' 
            WHERE icon = 'settings'
        `);
        
        await queryRunner.query(`
            UPDATE "services" 
            SET icon = 'mdi:account-hard-hat' 
            WHERE icon = 'hard-hat'
        `);

        await queryRunner.query(`
            UPDATE "services" 
            SET icon = 'mdi:handshake' 
            WHERE icon = 'handshake'
        `);
    }
} 