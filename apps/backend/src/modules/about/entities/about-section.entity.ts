import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { AboutSectionTranslation } from './about-section-translation.entity';

export enum AboutSectionType {
  HERO = 'hero',
  CONTENT = 'content',
  TEAM = 'team',
  MILESTONE = 'milestone',
  STATS = 'stats',
  GALLERY = 'gallery'
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

  @Column({ length: 100 })
  component_name: string;

  @Column({ default: 0 })
  order: number;

  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, any>;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => AboutSectionTranslation, translation => translation.section)
  translations: AboutSectionTranslation[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 