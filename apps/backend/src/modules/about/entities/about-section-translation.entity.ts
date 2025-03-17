import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AboutSection } from './about-section.entity';

@Entity('about_section_translations')
export class AboutSectionTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'about_section_id' })
  aboutSectionId: number;

  @Column({ name: 'language_code' })
  languageCode: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => AboutSection, section => section.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'about_section_id' })
  aboutSection: AboutSection;
} 