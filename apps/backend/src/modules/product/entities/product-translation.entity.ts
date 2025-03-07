import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_translations')
export class ProductTranslation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'product_id' })
  productId!: number;

  @Column({ length: 2 })
  locale!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  content!: string;

  @Column({ name: 'short_description', type: 'text', nullable: true })
  shortDescription!: string;

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => Product, product => product.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;
} 