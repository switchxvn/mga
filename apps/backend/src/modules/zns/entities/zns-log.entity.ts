import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ZnsTemplateType, ZnsMessageStatus } from '@ew/shared';
import { ZnsConfiguration } from './zns-configuration.entity';

@Entity('zns_logs')
@Index(['msg_id'])
@Index(['tracking_id'])
@Index(['recipient_phone'])
@Index(['status'])
@Index(['created_at'])
@Index(['related_entity_type', 'related_entity_id'])
export class ZnsLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  msg_id?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  tracking_id?: string;

  @Column({
    type: 'enum',
    enum: ZnsTemplateType,
  })
  template_type: ZnsTemplateType;

  @Column({ type: 'varchar', length: 255 })
  zalo_template_id: string;

  @Column({ type: 'varchar', length: 20 })
  recipient_phone: string;

  @Column({ type: 'json' })
  template_data: Record<string, any>;

  @Column({
    type: 'enum',
    enum: ZnsMessageStatus,
    default: ZnsMessageStatus.PENDING,
  })
  status: ZnsMessageStatus;

  @Column({ type: 'bigint', nullable: true })
  sent_time?: number;

  @Column({ type: 'bigint', nullable: true })
  delivery_time?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  error_code?: string;

  @Column({ type: 'text', nullable: true })
  error_message?: string;

  @Column()
  configuration_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  related_entity_type?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  related_entity_id?: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => ZnsConfiguration, (config) => config.logs, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'configuration_id' })
  configuration: ZnsConfiguration;
} 