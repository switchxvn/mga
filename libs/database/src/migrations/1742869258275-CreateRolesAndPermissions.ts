import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateRolesAndPermissions1742869258275 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create permissions table
        await queryRunner.createTable(
            new Table({
                name: "permissions",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "100",
                        isUnique: true,
                    },
                    {
                        name: "code",
                        type: "varchar",
                        length: "50",
                        isUnique: true,
                    },
                    {
                        name: "group_name",
                        type: "varchar",
                        length: "100",
                    },
                    {
                        name: "description",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                ],
            }),
            true
        );

        // Create roles table
        await queryRunner.createTable(
            new Table({
                name: "roles",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "name",
                        type: "varchar",
                        length: "100",
                        isUnique: true,
                    },
                    {
                        name: "code",
                        type: "varchar",
                        length: "50",
                        isUnique: true,
                    },
                    {
                        name: "group_name",
                        type: "varchar",
                        length: "100",
                    },
                    {
                        name: "description",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                ],
            }),
            true
        );

        // Create user_roles table
        await queryRunner.createTable(
            new Table({
                name: "user_roles",
                columns: [
                    {
                        name: "user_id",
                        type: "uuid",
                        isPrimary: true,
                    },
                    {
                        name: "role_id",
                        type: "uuid",
                        isPrimary: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                ],
            }),
            true
        );

        // Create user_permissions table
        await queryRunner.createTable(
            new Table({
                name: "user_permissions",
                columns: [
                    {
                        name: "user_id",
                        type: "uuid",
                        isPrimary: true,
                    },
                    {
                        name: "permission_id",
                        type: "uuid",
                        isPrimary: true,
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                    },
                ],
            }),
            true
        );

        // Add foreign key constraints
        await queryRunner.createForeignKey(
            "user_roles",
            new TableForeignKey({
                columnNames: ["user_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "user_roles",
            new TableForeignKey({
                columnNames: ["role_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "roles",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "user_permissions",
            new TableForeignKey({
                columnNames: ["user_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "user_permissions",
            new TableForeignKey({
                columnNames: ["permission_id"],
                referencedColumnNames: ["id"],
                referencedTableName: "permissions",
                onDelete: "CASCADE",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order to avoid foreign key constraints
        await queryRunner.dropTable("user_permissions");
        await queryRunner.dropTable("user_roles");
        await queryRunner.dropTable("roles");
        await queryRunner.dropTable("permissions");
    }

}
