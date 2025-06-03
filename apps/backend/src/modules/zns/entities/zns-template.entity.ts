import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ZnsTemplateType } from '@ew/shared';
import { ZnsConfiguration } from './zns-configuration.entity';

@Entity('zns_templates')
export class ZnsTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ZnsTemplateType,
  })
  template_type: ZnsTemplateType;

  @Column({ type: 'varchar', length: 255 })
  zalo_template_id: string;

  @Column({ type: 'varchar', length: 255 })
  template_name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'json', nullable: true })
  template_data_example?: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column()
  configuration_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => ZnsConfiguration, (config) => config.templates, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'configuration_id' })
  configuration: ZnsConfiguration;
} 