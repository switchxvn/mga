import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTicketPermissions1745000000002 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Thêm các quyền mới cho module Tickets
        await queryRunner.query(`
            INSERT INTO permissions (id, name, code, group_name, description, created_at, updated_at)
            VALUES
                -- Ticket scanning permissions
                (uuid_generate_v4(), 'View Tickets', 'VIEW_TICKETS', 'Ticket Management', 'Có thể xem danh sách vé và thông tin chi tiết', NOW(), NOW()),
                (uuid_generate_v4(), 'Scan Tickets', 'SCAN_TICKETS', 'Ticket Management', 'Có thể quét vé', NOW(), NOW()),
                (uuid_generate_v4(), 'View Scan History', 'VIEW_SCAN_HISTORY', 'Ticket Management', 'Có thể xem lịch sử quét vé', NOW(), NOW()),
                (uuid_generate_v4(), 'Search Tickets', 'SEARCH_TICKETS', 'Ticket Management', 'Có thể tìm kiếm thông tin vé', NOW(), NOW()),
                (uuid_generate_v4(), 'Manage Tickets', 'MANAGE_TICKETS', 'Ticket Management', 'Có thể quản lý tất cả chức năng vé', NOW(), NOW());
        `);

        // Gán quyền cho SUPER_ADMIN role
        await queryRunner.query(`
            -- Assign all new permissions to Super Admin
            INSERT INTO roles_permissions (role_id, permission_id)
            SELECT r.id, p.id
            FROM roles r
            CROSS JOIN permissions p
            WHERE r.code = 'SUPER_ADMIN' 
            AND p.group_name = 'Ticket Management'
            AND NOT EXISTS (
                SELECT 1 FROM roles_permissions rp 
                WHERE rp.role_id = r.id AND rp.permission_id = p.id
            );
        `);

        // Tạo role mới TICKET_MANAGER
        await queryRunner.query(`
            INSERT INTO roles (id, name, code, group_name, description, created_at, updated_at)
            VALUES (uuid_generate_v4(), 'Ticket Manager', 'TICKET_MANAGER', 'Roles', 'Quản lý vé và quyền soát vé', NOW(), NOW())
            ON CONFLICT (code) DO NOTHING;
        `);

        // Gán quyền cho TICKET_MANAGER
        await queryRunner.query(`
            -- Assign ticket management permissions to Ticket Manager role
            INSERT INTO roles_permissions (role_id, permission_id)
            SELECT r.id, p.id
            FROM roles r
            CROSS JOIN permissions p
            WHERE r.code = 'TICKET_MANAGER'
            AND p.group_name = 'Ticket Management';
        `);

        // Tạo role TICKET_SCANNER
        await queryRunner.query(`
            INSERT INTO roles (id, name, code, group_name, description, created_at, updated_at)
            VALUES (uuid_generate_v4(), 'Ticket Scanner', 'TICKET_SCANNER', 'Roles', 'Người chỉ có quyền soát vé', NOW(), NOW())
            ON CONFLICT (code) DO NOTHING;
        `);

        // Gán quyền cho TICKET_SCANNER
        await queryRunner.query(`
            -- Assign limited permissions to Ticket Scanner role
            INSERT INTO roles_permissions (role_id, permission_id)
            SELECT r.id, p.id
            FROM roles r
            CROSS JOIN permissions p
            WHERE r.code = 'TICKET_SCANNER'
            AND p.code IN ('SCAN_TICKETS', 'VIEW_TICKETS', 'SEARCH_TICKETS');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Xóa role_permissions trước
        await queryRunner.query(`
            DELETE FROM roles_permissions
            WHERE permission_id IN (
                SELECT id FROM permissions WHERE group_name = 'Ticket Management'
            );
        `);

        // Xóa các role đã tạo
        await queryRunner.query(`
            DELETE FROM roles WHERE code IN ('TICKET_MANAGER', 'TICKET_SCANNER');
        `);

        // Xóa permissions
        await queryRunner.query(`
            DELETE FROM permissions WHERE group_name = 'Ticket Management';
        `);
    }
} 