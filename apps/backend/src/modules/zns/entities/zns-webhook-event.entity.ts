import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('zns_webhook_events')
@Index(['msg_id'])
@Index(['tracking_id'])
@Index(['event_name'])
@Index(['processed'])
@Index(['created_at'])
export class ZnsWebhookEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  event_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  msg_id?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tracking_id?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sender?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  recipient?: string;

  @Column({ type: 'bigint', nullable: true })
  delivery_time?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  app_id?: string;

  @Column({ type: 'bigint', nullable: true })
  timestamp?: number;

  @Column({ type: 'json' })
  raw_payload: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  processed: boolean;

  @CreateDateColumn()
  created_at: Date;
} 