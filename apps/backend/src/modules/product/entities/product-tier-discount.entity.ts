import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('product_tier_discounts')
export class ProductTierDiscount {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'product_id', nullable: true })
  productId!: number | null;

  @Column({ name: 'product_variant_id', nullable: true })
  productVariantId!: number | null;

  @Column({ name: 'min_quantity' })
  minQuantity!: number;

  @Column({ name: 'discount_percent', type: 'decimal', precision: 5, scale: 2 })
  discountPercent!: number;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => Product, product => product.tierDiscounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @ManyToOne(() => ProductVariant, variant => variant.tierDiscounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_variant_id' })
  variant!: ProductVariant;
} 