import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Post } from './post.entity';

@Entity('post_translations')
export class PostTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ length: 2 })
  locale: string;

  @Column()
  slug: string;

  @Column({ name: 'short_description', type: 'text', nullable: true })
  shortDescription: string;

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

  @Column({ name: 'post_id' })
  postId: number;

  @ManyToOne(() => Post, (post) => post.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 