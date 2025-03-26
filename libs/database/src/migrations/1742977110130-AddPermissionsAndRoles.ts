import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPermissionsAndRoles1742977110130 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create roles_permissions junction table
        await queryRunner.query(`
            CREATE TABLE roles_permissions (
                role_id UUID NOT NULL,
                permission_id UUID NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                CONSTRAINT pk_roles_permissions PRIMARY KEY (role_id, permission_id),
                CONSTRAINT fk_roles_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
                CONSTRAINT fk_roles_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
            )
        `);

        // Add permissions
        await queryRunner.query(`
            INSERT INTO permissions (id, name, code, group_name, description, created_at, updated_at)
            VALUES
            -- User management permissions
            (uuid_generate_v4(), 'View Users', 'VIEW_USERS', 'User Management', 'Can view list of users', NOW(), NOW()),
            (uuid_generate_v4(), 'Create Users', 'CREATE_USERS', 'User Management', 'Can create new users', NOW(), NOW()),
            (uuid_generate_v4(), 'Edit Users', 'EDIT_USERS', 'User Management', 'Can edit existing users', NOW(), NOW()),
            (uuid_generate_v4(), 'Delete Users', 'DELETE_USERS', 'User Management', 'Can delete users', NOW(), NOW()),
            
            -- Role management permissions
            (uuid_generate_v4(), 'View Roles', 'VIEW_ROLES', 'Role Management', 'Can view list of roles', NOW(), NOW()),
            (uuid_generate_v4(), 'Create Roles', 'CREATE_ROLES', 'Role Management', 'Can create new roles', NOW(), NOW()),
            (uuid_generate_v4(), 'Edit Roles', 'EDIT_ROLES', 'Role Management', 'Can edit existing roles', NOW(), NOW()),
            (uuid_generate_v4(), 'Delete Roles', 'DELETE_ROLES', 'Role Management', 'Can delete roles', NOW(), NOW()),
            
            -- Product management permissions
            (uuid_generate_v4(), 'View Products', 'VIEW_PRODUCTS', 'Product Management', 'Can view list of products', NOW(), NOW()),
            (uuid_generate_v4(), 'Create Products', 'CREATE_PRODUCTS', 'Product Management', 'Can create new products', NOW(), NOW()),
            (uuid_generate_v4(), 'Edit Products', 'EDIT_PRODUCTS', 'Product Management', 'Can edit existing products', NOW(), NOW()),
            (uuid_generate_v4(), 'Delete Products', 'DELETE_PRODUCTS', 'Product Management', 'Can delete products', NOW(), NOW()),
            
            -- Content management permissions
            (uuid_generate_v4(), 'View Content', 'VIEW_CONTENT', 'Content Management', 'Can view website content', NOW(), NOW()),
            (uuid_generate_v4(), 'Create Content', 'CREATE_CONTENT', 'Content Management', 'Can create new content', NOW(), NOW()),
            (uuid_generate_v4(), 'Edit Content', 'EDIT_CONTENT', 'Content Management', 'Can edit existing content', NOW(), NOW()),
            (uuid_generate_v4(), 'Delete Content', 'DELETE_CONTENT', 'Content Management', 'Can delete content', NOW(), NOW()),
            
            -- Settings management permissions
            (uuid_generate_v4(), 'View Settings', 'VIEW_SETTINGS', 'Settings Management', 'Can view system settings', NOW(), NOW()),
            (uuid_generate_v4(), 'Edit Settings', 'EDIT_SETTINGS', 'Settings Management', 'Can edit system settings', NOW(), NOW())
        `);

        // Add roles
        await queryRunner.query(`
            INSERT INTO roles (id, name, code, group_name, description, created_at, updated_at)
            VALUES
            -- Super Admin role
            (uuid_generate_v4(), 'Super Administrator', 'SUPER_ADMIN', 'System', 'Has full access to all system features', NOW(), NOW()),
            
            -- Content roles
            (uuid_generate_v4(), 'Content Manager', 'CONTENT_MANAGER', 'Content', 'Can manage all content related features', NOW(), NOW()),
            (uuid_generate_v4(), 'Content Editor', 'CONTENT_EDITOR', 'Content', 'Can edit content but cannot delete', NOW(), NOW()),
            
            -- Product roles
            (uuid_generate_v4(), 'Product Manager', 'PRODUCT_MANAGER', 'Products', 'Can manage all product related features', NOW(), NOW()),
            (uuid_generate_v4(), 'Product Editor', 'PRODUCT_EDITOR', 'Products', 'Can edit products but cannot delete', NOW(), NOW()),
            
            -- User roles
            (uuid_generate_v4(), 'User Manager', 'USER_MANAGER', 'Users', 'Can manage all user related features', NOW(), NOW()),
            (uuid_generate_v4(), 'Basic User', 'BASIC_USER', 'Users', 'Basic user with limited permissions', NOW(), NOW())
        `);

        // Assign permissions to roles
        await queryRunner.query(`
            -- Assign all permissions to Super Admin
            INSERT INTO roles_permissions (role_id, permission_id)
            SELECT r.id, p.id
            FROM roles r
            CROSS JOIN permissions p
            WHERE r.code = 'SUPER_ADMIN';

            -- Assign Content Manager permissions
            INSERT INTO roles_permissions (role_id, permission_id)
            SELECT r.id, p.id
            FROM roles r
            CROSS JOIN permissions p
            WHERE r.code = 'CONTENT_MANAGER'
            AND p.code IN ('VIEW_CONTENT', 'CREATE_CONTENT', 'EDIT_CONTENT', 'DELETE_CONTENT');

            -- Assign Content Editor permissions
            INSERT INTO roles_permissions (role_id, permission_id)
            SELECT r.id, p.id
            FROM roles r
            CROSS JOIN permissions p
            WHERE r.code = 'CONTENT_EDITOR'
            AND p.code IN ('VIEW_CONTENT', 'EDIT_CONTENT');

            -- Assign Product Manager permissions
            INSERT INTO roles_permissions (role_id, permission_id)
            SELECT r.id, p.id
            FROM roles r
            CROSS JOIN permissions p
            WHERE r.code = 'PRODUCT_MANAGER'
            AND p.code IN ('VIEW_PRODUCTS', 'CREATE_PRODUCTS', 'EDIT_PRODUCTS', 'DELETE_PRODUCTS');

            -- Assign Product Editor permissions
            INSERT INTO roles_permissions (role_id, permission_id)
            SELECT r.id, p.id
            FROM roles r
            CROSS JOIN permissions p
            WHERE r.code = 'PRODUCT_EDITOR'
            AND p.code IN ('VIEW_PRODUCTS', 'EDIT_PRODUCTS');

            -- Assign User Manager permissions
            INSERT INTO roles_permissions (role_id, permission_id)
            SELECT r.id, p.id
            FROM roles r
            CROSS JOIN permissions p
            WHERE r.code = 'USER_MANAGER'
            AND p.code IN ('VIEW_USERS', 'CREATE_USERS', 'EDIT_USERS', 'DELETE_USERS');

            -- Assign Basic User permissions
            INSERT INTO roles_permissions (role_id, permission_id)
            SELECT r.id, p.id
            FROM roles r
            CROSS JOIN permissions p
            WHERE r.code = 'BASIC_USER'
            AND p.code IN ('VIEW_PRODUCTS', 'VIEW_CONTENT');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove role-permission assignments
        await queryRunner.query(`DROP TABLE roles_permissions`);
        
        // Remove all roles
        await queryRunner.query(`DELETE FROM roles`);
        
        // Remove all permissions
        await queryRunner.query(`DELETE FROM permissions`);
    }
} 