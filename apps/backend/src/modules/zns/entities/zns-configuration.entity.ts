import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ZnsTemplate } from './zns-template.entity';
import { ZnsLog } from './zns-log.entity';

@Entity('zns_configurations')
export class ZnsConfiguration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  app_id: string;

  @Column({ type: 'varchar', length: 500 })
  app_secret: string;

  @Column({ type: 'text', nullable: true })
  access_token?: string;

  @Column({ type: 'text', nullable: true })
  refresh_token?: string;

  @Column({ type: 'timestamp', nullable: true })
  token_expires_at?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  oa_id?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  webhook_url?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  webhook_secret?: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'int', default: 0 })
  daily_quota: number;

  @Column({ type: 'int', default: 0 })
  remaining_quota: number;

  @Column({ type: 'timestamp', nullable: true })
  quota_reset_at?: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => ZnsTemplate, (template) => template.configuration)
  templates: ZnsTemplate[];

  @OneToMany(() => ZnsLog, (log) => log.configuration)
  logs: ZnsLog[];
} 