import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { AboutPage } from './about-page.entity';
import { AboutSectionTranslation } from './about-section-translation.entity';

@Entity('about_sections')
export class AboutSection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'about_page_id' })
  aboutPageId: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ name: 'video_url', nullable: true })
  videoUrl: string;

  @Column({ name: 'section_type', default: 'text' })
  sectionType: string;

  @Column({ default: 0 })
  order: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => AboutPage, aboutPage => aboutPage.sections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'about_page_id' })
  aboutPage: AboutPage;

  @OneToMany(() => AboutSectionTranslation, translation => translation.aboutSection, { cascade: true })
  translations: AboutSectionTranslation[];
} 