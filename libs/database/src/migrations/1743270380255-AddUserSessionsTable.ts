import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class AddUserSessionsTable1743270380255 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "user_sessions",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment"
                    },
                    {
                        name: "user_id",
                        type: "uuid",
                        isNullable: true
                    },
                    {
                        name: "session_id",
                        type: "varchar",
                        length: "100",
                        isNullable: false
                    },
                    {
                        name: "ip_address",
                        type: "varchar",
                        length: "45",
                        isNullable: true
                    },
                    {
                        name: "user_agent",
                        type: "varchar",
                        length: "255",
                        isNullable: true
                    },
                    {
                        name: "device_info",
                        type: "json",
                        isNullable: true
                    },
                    {
                        name: "start_time",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP"
                    },
                    {
                        name: "last_activity",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP"
                    },
                    {
                        name: "total_time",
                        type: "int",
                        default: "0",
                        comment: "Total time in seconds"
                    },
                    {
                        name: "is_active",
                        type: "boolean",
                        default: true
                    },
                    {
                        name: "page_views",
                        type: "int",
                        default: "1",
                        comment: "Number of page views in this session"
                    },
                    {
                        name: "referrer",
                        type: "varchar",
                        length: "255",
                        isNullable: true
                    },
                    {
                        name: "landing_page",
                        type: "varchar",
                        length: "255",
                        isNullable: true
                    },
                    {
                        name: "exit_page",
                        type: "varchar",
                        length: "255",
                        isNullable: true
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP"
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP",
                        onUpdate: "CURRENT_TIMESTAMP"
                    }
                ],
                foreignKeys: [
                    {
                        columnNames: ["user_id"],
                        referencedTableName: "users",
                        referencedColumnNames: ["id"],
                        onDelete: "SET NULL"
                    }
                ]
            }),
            true
        );

        // Create index for session_id for quick lookups
        await queryRunner.createIndex(
            "user_sessions",
            new TableIndex({
                name: "IDX_USER_SESSIONS_SESSION_ID",
                columnNames: ["session_id"]
            })
        );

        // Create index for user_id for quick lookups
        await queryRunner.createIndex(
            "user_sessions",
            new TableIndex({
                name: "IDX_USER_SESSIONS_USER_ID",
                columnNames: ["user_id"]
            })
        );

        // Create index for is_active for filtering active sessions
        await queryRunner.createIndex(
            "user_sessions",
            new TableIndex({
                name: "IDX_USER_SESSIONS_IS_ACTIVE",
                columnNames: ["is_active"]
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.dropIndex("user_sessions", "IDX_USER_SESSIONS_IS_ACTIVE");
        await queryRunner.dropIndex("user_sessions", "IDX_USER_SESSIONS_USER_ID");
        await queryRunner.dropIndex("user_sessions", "IDX_USER_SESSIONS_SESSION_ID");
        
        // Drop table
        await queryRunner.dropTable("user_sessions");
    }
} 