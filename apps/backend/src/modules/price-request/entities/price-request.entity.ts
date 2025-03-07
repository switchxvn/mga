import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../../product/entities/product.entity';

export enum PriceRequestStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

@Entity('price_requests')
export class PriceRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'full_name' })
  fullName!: string;

  @Column()
  email!: string;

  @Column()
  phone!: string;

  @Column({ type: 'text', nullable: true })
  message!: string;

  @Column({ name: 'product_id' })
  productId!: number;

  @Column({ name: 'product_name' })
  productName!: string;

  @Column({
    type: 'enum',
    enum: PriceRequestStatus,
    default: PriceRequestStatus.PENDING
  })
  status!: PriceRequestStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => Product, product => product.priceRequests)
  @JoinColumn({ name: 'product_id' })
  product!: Product;
} 