import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Theme } from './theme.entity';

@Entity('theme_sections')
export class ThemeSection {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'theme_id' })
  themeId!: number;

  @Column({ length: 50 })
  type!: string;

  @Column()
  title!: string;

  @Column({ type: 'int', default: 0 })
  order!: number;

  @Column({ type: 'jsonb', default: {
    layout: 'split-columns', // 'split-columns' | 'stacked-rows'
    height: '600px',
    autoplay: true,
    interval: 5000,
    showDots: true,
    showArrows: true,
    videoWidth: '30%',
    sliderWidth: '70%',
    videoPosition: 'left',
    sliderPosition: 'right',
    maxVideos: 3,
    videoRowHeight: '300px', // Chỉ áp dụng cho layout 'stacked-rows'
    gap: '0.5rem',
    videoGap: '0.5rem',
    backgroundGradient: {
      from: 'rgba(0,0,0,0.7)',
      to: 'rgba(0,0,0,0)',
      direction: 'to-t'
    },
    overlayOpacity: '0.5'
  } })
  settings!: Record<string, any>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Theme, theme => theme.sections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'theme_id' })
  theme!: Theme;
} 