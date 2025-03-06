import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Category } from '../../category/entities/category.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  content!: string;

  @Column({ default: false })
  published!: boolean;

  // SEO fields
  @Column({ nullable: true })
  slug!: string;

  @Column({ name: 'meta_title', nullable: true })
  metaTitle!: string;

  @Column({ name: 'meta_description', type: 'text', nullable: true })
  metaDescription!: string;

  @Column({ name: 'meta_keywords', nullable: true })
  metaKeywords!: string;

  @Column({ name: 'og_title', nullable: true })
  ogTitle!: string;

  @Column({ name: 'og_description', type: 'text', nullable: true })
  ogDescription!: string;

  @Column({ name: 'og_image', nullable: true })
  ogImage!: string;

  @Column({ name: 'canonical_url', nullable: true })
  canonicalUrl!: string;

  @Column({ name: 'author_id' })
  authorId!: number;

  @ManyToOne(() => User, (user) => user.posts, { lazy: true })
  @JoinColumn({ name: 'author_id' })
  author!: Promise<User>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToMany(() => Category, (category) => category.posts)
  categories!: Category[];
}