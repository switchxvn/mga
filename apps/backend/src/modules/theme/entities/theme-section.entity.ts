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
import { PageType } from '@ew/shared';

@Entity('theme_sections')
export class ThemeSection {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'theme_id' })
  themeId!: number;

  @Column({ length: 50 })
  type!: string;

  @Column({ name: 'component_name', length: 100, nullable: true })
  componentName?: string;

  @Column()
  title!: string;

  @Column({ type: 'int', default: 0 })
  order!: number;

  @Column({ type: 'enum', enum: PageType, name: 'page_type', default: PageType.HOME_PAGE })
  pageType!: PageType;

  @Column({ type: 'jsonb', default: {
    layout: '', // 'split-columns' | 'stacked-rows'
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
    overlayOpacity: '0.5',
    description: '',
    image: '',
    stats: [
      { value: '150+', label: 'Khách hàng' },
      { value: '10+', label: 'Năm kinh nghiệm' },
      { value: '1000+', label: 'Dự án' },
      { value: '24/7', label: 'Hỗ trợ' }
    ],
    buttonText: 'Tìm hiểu thêm',
    buttonLink: '/about',
    backgroundColor: '',
    textColor: ''
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