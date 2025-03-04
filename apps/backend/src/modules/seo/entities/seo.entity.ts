import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('seo')
export class Seo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'og_title', nullable: true })
  ogTitle: string;

  @Column({ name: 'og_description', nullable: true })
  ogDescription: string;

  @Column({ name: 'og_image', nullable: true })
  ogImage: string;

  @Column({ nullable: true })
  keywords: string;

  @Column({ name: 'canonical_url', nullable: true })
  canonicalUrl: string;

  @Column({ name: 'page_path', unique: true })
  pagePath: string;

  @Column({ name: 'robots_txt', nullable: true })
  robotsTxt: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 