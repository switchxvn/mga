import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { ProductVariant } from './product-variant.entity';

export enum StockAdjustmentType {
  ADMIN_ADJUSTMENT = 'ADMIN_ADJUSTMENT',
  CUSTOMER_ORDER = 'CUSTOMER_ORDER',
  REFUND = 'REFUND',
  INVENTORY_CHECK = 'INVENTORY_CHECK',
  RETURN = 'RETURN',
  DAMAGED = 'DAMAGED',
  INITIAL_STOCK = 'INITIAL_STOCK',
}

@Entity('product_stock_history')
export class ProductStockHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'product_id', nullable: true })
  productId!: number | null;

  @Column({ name: 'variant_id', nullable: true })
  variantId!: number | null;

  @Column({
    type: 'enum',
    enum: StockAdjustmentType,
    name: 'adjustment_type',
  })
  adjustmentType!: StockAdjustmentType;

  @Column({ name: 'quantity_before' })
  quantityBefore!: number;

  @Column({ name: 'adjustment_quantity' })
  adjustmentQuantity!: number;

  @Column({ name: 'quantity_after' })
  quantityAfter!: number;

  @Column({ name: 'reference_id', nullable: true })
  referenceId!: number | null;

  @Column({ name: 'reference_type', nullable: true })
  referenceType!: string | null;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @Column({ name: 'user_id', nullable: true })
  userId!: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => Product, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @ManyToOne(() => ProductVariant, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'variant_id' })
  variant!: ProductVariant;
} 