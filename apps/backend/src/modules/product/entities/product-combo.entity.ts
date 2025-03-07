import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('product_combos')
export class ProductCombo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'main_product_id' })
  mainProductId!: number;

  @Column({ name: 'combo_product_id' })
  comboProductId!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountAmount!: number | null;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  discountPercent!: number | null;

  @Column({ default: 0 })
  position!: number;

  @Column({ default: true })
  active!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => Product, product => product.productCombos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'main_product_id' })
  mainProduct!: Product;

  @ManyToOne(() => Product, product => product.includedInCombos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'combo_product_id' })
  comboProduct!: Product;
} 