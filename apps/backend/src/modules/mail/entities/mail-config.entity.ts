import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('mail_config')
export class MailConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'code', type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ name: 'config', type: 'jsonb' })
  config: {
    // Common fields
    from?: string;
    host?: string;
    
    // Mailgun specific
    apiKey?: string;
    domain?: string;
    region?: string;
    apiToken?: string;
    fromName?: string;

    // Mailtrap specific
    port?: number;
    auth?: {
      user: string;
      pass: string;
    };
    secure?: boolean;
  };

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 