import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AboutSection } from './about-section.entity';

@Entity('about_section_translations')
export class AboutSectionTranslation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'section_id' })
  sectionId!: number;

  @Column({ name: 'locale', length: 2 })
  locale!: string;

  @Column({ name: 'title' })
  title!: string;

  @Column({ name: 'subtitle', type: 'text', nullable: true })
  subtitle?: string;

  @Column({ name: 'content', type: 'text', nullable: true })
  content?: string;

  @Column({ name: 'data', type: 'jsonb', nullable: true })
  data?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => AboutSection, section => section.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'section_id' })
  section!: AboutSection;
} 