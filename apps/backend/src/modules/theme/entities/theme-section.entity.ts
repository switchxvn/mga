import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Theme } from './theme.entity';
import { ThemeSectionTranslation } from './theme-section-translation.entity';
import { PageType as SharedPageType } from '@ew/shared';

// Define PageType enum locally for application code only
export enum PageType {
  HOME_PAGE = 'home_page',
  NEWS_PAGE = 'news_page',
  PRODUCT_PAGE = 'product_page',
  ABOUT_PAGE = 'about_page',
  SERVICE_PAGE = 'service_page',
  CONTACT_PAGE = 'contact_page',
  REVIEWS_PAGE = 'reviews_page',
  TICKET_PRICING_PAGE = 'ticket_pricing_page',
  COMMON = 'common'
}

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

  // Title field is kept for backward compatibility but will be removed in future
  @Column({ nullable: true })
  title?: string;

  @Column({ type: 'int', default: 0 })
  order!: number;

  @Column({ name: 'page_type', type: 'varchar', length: 50, default: PageType.HOME_PAGE })
  pageType!: string;

  // Settings will be moved to translations in the future
  @Column({ type: 'jsonb', nullable: true })
  settings?: Record<string, any>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Theme, theme => theme.sections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'theme_id' })
  theme!: Theme;

  @OneToMany(() => ThemeSectionTranslation, translation => translation.section, {
    cascade: true
  })
  translations!: ThemeSectionTranslation[];
} 