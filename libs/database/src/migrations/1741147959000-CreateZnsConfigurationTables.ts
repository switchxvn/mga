import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateZnsConfigurationTables1741147959000 implements MigrationInterface {
  name = 'CreateZnsConfigurationTables1741147959000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create zns_configurations table for storing Zalo API credentials and settings
    await queryRunner.query(`
      CREATE TABLE "zns_configurations" (
        "id" SERIAL PRIMARY KEY,
        "name" varchar(255) NOT NULL,
        "app_id" varchar(255) NOT NULL,
        "app_secret" varchar(500) NOT NULL,
        "access_token" text,
        "refresh_token" text,
        "token_expires_at" timestamp,
        "oa_id" varchar(255),
        "webhook_url" varchar(500),
        "webhook_secret" varchar(255),
        "is_active" boolean NOT NULL DEFAULT true,
        "daily_quota" int DEFAULT 0,
        "remaining_quota" int DEFAULT 0,
        "quota_reset_at" timestamp,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "UQ_zns_configurations_name" UNIQUE ("name"),
        CONSTRAINT "UQ_zns_configurations_app_id" UNIQUE ("app_id")
      )
    `);

    // Create enum type for template types
    await queryRunner.query(`
      CREATE TYPE "zns_template_type_enum" AS ENUM (
        'ORDER_CONFIRMATION',
        'ORDER_STATUS_UPDATE', 
        'PAYMENT_CONFIRMATION',
        'TICKET_BOOKING_SUCCESS',
        'TICKET_REMINDER',
        'PRICE_REQUEST_RECEIVED',
        'PRICE_REQUEST_RESPONSE',
        'SYSTEM_NOTIFICATION',
        'PROMOTIONAL_MESSAGE',
        'USER_VERIFICATION',
        'PASSWORD_RESET'
      )
    `);

    // Create zns_templates table for mapping local template types to Zalo template IDs
    await queryRunner.query(`
      CREATE TABLE "zns_templates" (
        "id" SERIAL PRIMARY KEY,
        "template_type" "zns_template_type_enum" NOT NULL,
        "zalo_template_id" varchar(255) NOT NULL,
        "template_name" varchar(255) NOT NULL,
        "description" text,
        "template_data_example" jsonb,
        "is_active" boolean NOT NULL DEFAULT true,
        "configuration_id" int NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "UQ_zns_templates_type_config" UNIQUE ("template_type", "configuration_id"),
        CONSTRAINT "FK_zns_templates_configuration" FOREIGN KEY ("configuration_id") REFERENCES "zns_configurations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    // Create enum type for message status
    await queryRunner.query(`
      CREATE TYPE "zns_message_status_enum" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED')
    `);

    // Create zns_logs table for tracking sent messages
    await queryRunner.query(`
      CREATE TABLE "zns_logs" (
        "id" SERIAL PRIMARY KEY,
        "msg_id" varchar(255),
        "tracking_id" varchar(255),
        "template_type" "zns_template_type_enum" NOT NULL,
        "zalo_template_id" varchar(255) NOT NULL,
        "recipient_phone" varchar(20) NOT NULL,
        "template_data" jsonb NOT NULL,
        "status" "zns_message_status_enum" NOT NULL DEFAULT 'PENDING',
        "sent_time" bigint,
        "delivery_time" bigint,
        "error_code" varchar(50),
        "error_message" text,
        "configuration_id" int NOT NULL,
        "related_entity_type" varchar(100),
        "related_entity_id" varchar(100),
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "FK_zns_logs_configuration" FOREIGN KEY ("configuration_id") REFERENCES "zns_configurations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    // Create indexes for zns_logs
    await queryRunner.query(`CREATE INDEX "IDX_zns_logs_msg_id" ON "zns_logs" ("msg_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_zns_logs_tracking_id" ON "zns_logs" ("tracking_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_zns_logs_recipient" ON "zns_logs" ("recipient_phone")`);
    await queryRunner.query(`CREATE INDEX "IDX_zns_logs_status" ON "zns_logs" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_zns_logs_created_at" ON "zns_logs" ("created_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_zns_logs_related_entity" ON "zns_logs" ("related_entity_type", "related_entity_id")`);

    // Create zns_webhook_events table for storing webhook events from Zalo
    await queryRunner.query(`
      CREATE TABLE "zns_webhook_events" (
        "id" SERIAL PRIMARY KEY,
        "event_name" varchar(100) NOT NULL,
        "msg_id" varchar(255),
        "tracking_id" varchar(255),
        "sender" varchar(255),
        "recipient" varchar(20),
        "delivery_time" bigint,
        "app_id" varchar(255),
        "timestamp" bigint,
        "raw_payload" jsonb NOT NULL,
        "processed" boolean NOT NULL DEFAULT false,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for zns_webhook_events
    await queryRunner.query(`CREATE INDEX "IDX_zns_webhook_events_msg_id" ON "zns_webhook_events" ("msg_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_zns_webhook_events_tracking_id" ON "zns_webhook_events" ("tracking_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_zns_webhook_events_event_name" ON "zns_webhook_events" ("event_name")`);
    await queryRunner.query(`CREATE INDEX "IDX_zns_webhook_events_processed" ON "zns_webhook_events" ("processed")`);
    await queryRunner.query(`CREATE INDEX "IDX_zns_webhook_events_created_at" ON "zns_webhook_events" ("created_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "zns_webhook_events"`);
    await queryRunner.query(`DROP TABLE "zns_logs"`);
    await queryRunner.query(`DROP TABLE "zns_templates"`);
    await queryRunner.query(`DROP TABLE "zns_configurations"`);
    await queryRunner.query(`DROP TYPE "zns_message_status_enum"`);
    await queryRunner.query(`DROP TYPE "zns_template_type_enum"`);
  }
} 