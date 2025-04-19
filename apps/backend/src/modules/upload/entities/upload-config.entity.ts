import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('upload_config')
export class UploadConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 's3' })
  provider: string;

  @Column()
  endpoint: string;

  @Column()
  region: string;

  @Column()
  bucket: string;

  @Column({ name: 'access_key' })
  accessKey: string;

  @Column({ name: 'secret_key' })
  secretKey: string;

  @Column({ name: 'public_url' })
  publicUrl: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 