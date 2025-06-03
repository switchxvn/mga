import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from '../../product/entities/product.entity';
import { ProductVariant } from '../../product/entities/product-variant.entity';

@Entity('cart_items')
@Index(['cartId', 'productId', 'variantId'], { unique: true })
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'cart_id' })
  cartId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column({ name: 'variant_id', nullable: true })
  variantId?: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ 
    name: 'unit_price',
    type: 'decimal', 
    precision: 10, 
    scale: 2 
  })
  unitPrice: number;

  @Column({ 
    name: 'discount_percent',
    type: 'decimal', 
    precision: 5, 
    scale: 2,
    default: 0
  })
  discountPercent: number;

  @Column({ 
    name: 'final_price',
    type: 'decimal', 
    precision: 10, 
    scale: 2 
  })
  finalPrice: number;

  @Column({ 
    type: 'jsonb', 
    nullable: true,
    comment: 'Additional data like selected attributes, notes, etc.'
  })
  metadata?: Record<string, any>;

  @ManyToOne(() => Cart, cart => cart.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => ProductVariant)
  @JoinColumn({ name: 'variant_id' })
  variant?: ProductVariant;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 