import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { ProductTranslation } from './product-translation.entity';
import { Category } from '../../category/entities/category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  sku!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'compare_price' })
  comparePrice!: number | null;

  @Column({ nullable: true })
  thumbnail!: string;

  @Column({ type: 'json', nullable: true })
  gallery!: string[];

  @Column({ default: true })
  published!: boolean;

  @Column({ default: 0 })
  quantity!: number;

  @Column({ name: 'is_featured', default: false })
  isFeatured!: boolean;

  @Column({ name: 'is_new', default: false })
  isNew!: boolean;

  @Column({ name: 'is_sale', default: false })
  isSale!: boolean;

  // SEO fields
  @Column({ nullable: true })
  slug!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @OneToMany(() => ProductTranslation, translation => translation.product, { cascade: true })
  translations!: ProductTranslation[];

  @ManyToMany(() => Category, (category) => category.products)
  @JoinTable({
    name: 'product_categories',
    joinColumn: {
      name: 'product_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id'
    }
  })
  categories!: Category[];
} 