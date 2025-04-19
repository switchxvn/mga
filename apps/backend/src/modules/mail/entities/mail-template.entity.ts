import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@Entity('mail_templates')
export class MailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @IsNotEmpty()
  @IsString()
  code: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  title: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  subject: string;

  @Column({ type: 'text' })
  @IsNotEmpty()
  html: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Column()
  @IsNotEmpty()
  @IsEmail()
  from_email: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  from_name: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  variables?: Record<string, string>;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 