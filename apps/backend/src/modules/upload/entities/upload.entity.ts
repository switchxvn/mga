import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('uploads')
export class Upload {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'original_name' })
  originalName: string;

  @Column()
  filename: string;

  @Column()
  path: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column()
  size: number;

  @Column()
  url: string;

  @Column({ default: 's3' })
  provider: string;

  @Column({ default: 'public-read' })
  acl: string;

  @Column({ name: 'upload_by', type: 'uuid', nullable: true })
  uploadBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'upload_by' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 