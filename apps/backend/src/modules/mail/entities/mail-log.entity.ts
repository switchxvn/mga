import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum MailStatus {
  SENT = 'SENT',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  BOUNCED = 'BOUNCED',
}

@Entity('mail_logs')
export class MailLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'from_email', type: 'varchar', length: 255 })
  fromEmail: string;

  @Column({ name: 'to_email', type: 'varchar', length: 255 })
  toEmail: string;

  @Column({ name: 'subject', type: 'varchar', length: 255 })
  subject: string;

  @Column({ name: 'body', type: 'text' })
  body: string;

  @Column({ name: 'template_id', type: 'varchar', length: 255, nullable: true })
  templateId: string;

  @Column({ name: 'template_data', type: 'jsonb', nullable: true })
  templateData: Record<string, any>;

  @Column({ 
    name: 'status',
    type: 'varchar', 
    length: 50,
    enum: MailStatus,
    default: MailStatus.PENDING 
  })
  status: MailStatus;

  @Column({ name: 'error', type: 'text', nullable: true })
  error: string;

  @Column({ name: 'provider_message_id', type: 'varchar', length: 255, nullable: true })
  providerMessageId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 