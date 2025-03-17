import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AboutPage } from './about-page.entity';

@Entity('about_page_translations')
export class AboutPageTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'about_page_id' })
  aboutPageId: number;

  @Column({ name: 'language_code' })
  languageCode: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  subtitle: string;

  @Column({ name: 'meta_title', nullable: true })
  metaTitle: string;

  @Column({ name: 'meta_description', nullable: true })
  metaDescription: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => AboutPage, page => page.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'about_page_id' })
  aboutPage: AboutPage;
} 