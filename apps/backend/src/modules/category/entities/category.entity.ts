import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Post } from '../../post/entities/post.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ default: true })
  active!: boolean;

  @Column({ default: false, name: 'is_featured' })
  isFeatured!: boolean;

  // SEO fields
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

  // Parent-child relationship
  @Column({ name: 'parent_id', nullable: true })
  parentId!: number | null;

  @ManyToOne(() => Category, category => category.children)
  @JoinColumn({ name: 'parent_id' })
  parent!: Category | null;

  @OneToMany(() => Category, category => category.parent)
  children!: Category[];

  @ManyToMany(() => Post, (post) => post.categories)
  @JoinTable({
    name: 'post_categories',
    joinColumn: {
      name: 'category_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'post_id',
      referencedColumnName: 'id'
    }
  })
  posts!: Post[];

  @ManyToMany(() => Product, (product) => product.categories)
  products!: Product[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
} 