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
  id: number;

  @Column({ name: 'section_id' })
  sectionId: number;

  @Column({ length: 2 })
  locale: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  subtitle: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @ManyToOne(() => AboutSection, section => section.translations)
  @JoinColumn({ name: 'section_id' })
  section: AboutSection;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 