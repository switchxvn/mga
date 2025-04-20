import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../product/entities/product.entity';

export enum ProductType {
  PHYSICAL = 'PHYSICAL',
  DIGITAL = 'DIGITAL',
  TICKET = 'TICKET'
}

export interface ProductSnapshot {
  id: number;
  title: string;
  variant?: {
    id: number;
    name: string;
    price: number;
  };
  translations: {
    locale: string;
    title: string;
    description?: string;
  }[];
}

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id' })
  orderId: number;

  @Column({ name: 'product_id' })
  productId: number;

  @Column()
  quantity: number;

  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 10,
    scale: 2
  })
  unitPrice: number;

  @Column({
    name: 'total_price',
    type: 'decimal',
    precision: 10,
    scale: 2
  })
  totalPrice: number;

  @Column({
    name: 'product_type',
    type: 'enum',
    enum: ProductType,
    default: ProductType.PHYSICAL
  })
  productType: ProductType;

  @Column({
    name: 'is_used',
    type: 'boolean',
    default: false
  })
  isUsed: boolean;

  @Column({
    name: 'product_code',
    nullable: true,
    length: 50
  })
  productCode: string;

  @Column({
    name: 'qr_code',
    nullable: true
  })
  qrCode: string;

  @Column({
    name: 'image_qr_code',
    nullable: true,
    comment: 'URL of the QR code image stored in S3'
  })
  imageQrCode: string;

  @Column({
    name: 'product_snapshot',
    type: 'jsonb',
    nullable: true
  })
  productSnapshot: ProductSnapshot;

  @ManyToOne(() => Order, order => order.items)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 