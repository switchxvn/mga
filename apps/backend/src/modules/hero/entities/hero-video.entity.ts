import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Theme } from '../../theme/entities/theme.entity';

@Entity('hero_videos')
export class HeroVideo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ length: 255, name: 'video_url' })
  videoUrl!: string;

  @Column({ length: 255, nullable: true, name: 'thumbnail_url' })
  thumbnailUrl!: string;

  @Column({ length: 255, nullable: true })
  link!: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @Column({ type: 'int', default: 0 })
  order!: number;

  @Column({ name: 'theme_id', nullable: true })
  themeId!: number;

  @ManyToOne(() => Theme, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'theme_id' })
  theme!: Theme;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
} 