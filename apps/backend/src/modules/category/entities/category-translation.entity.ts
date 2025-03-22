import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Category } from './category.entity';

@Entity('category_translations')
export class CategoryTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 2 })
  locale: string;

  // SEO fields
  @Column({ name: 'meta_title', nullable: true })
  metaTitle: string;

  @Column({ name: 'meta_description', type: 'text', nullable: true })
  metaDescription: string;

  @Column({ name: 'meta_keywords', nullable: true })
  metaKeywords: string;

  @Column({ name: 'og_title', nullable: true })
  ogTitle: string;

  @Column({ name: 'og_description', type: 'text', nullable: true })
  ogDescription: string;

  @Column({ name: 'og_image', nullable: true })
  ogImage: string;

  @Column({ name: 'canonical_url', nullable: true })
  canonicalUrl: string;

  @Column({ name: 'category_id' })
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 