import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { AboutSectionTranslation } from './about-section-translation.entity';

export enum AboutSectionType {
  HERO = 'hero',
  CONTENT = 'content',
  TEAM = 'team',
  MILESTONE = 'milestone',
  STATS = 'stats',
  GALLERY = 'gallery',
  FEATURES = 'features',
  CULTURAL = 'cultural',
  TOURISM_HERO = 'tourism_hero',
  TOURISM_FEATURES = 'tourism_features',
  TOURISM_CULTURAL = 'tourism_cultural'
}

@Entity('about_sections')
export class AboutSection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: AboutSectionType,
    default: AboutSectionType.CONTENT
  })
  type: AboutSectionType;

  @Column({ length: 100, name: 'component_name' })
  componentName: string;

  @Column({ default: 0, name: 'order' })
  order: number;

  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, any>;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @OneToMany(() => AboutSectionTranslation, translation => translation.section)
  translations: AboutSectionTranslation[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 