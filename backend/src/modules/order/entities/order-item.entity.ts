import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../shared/entities/base.entity';
import { Order } from './order.entity';
import { Product } from '../../product/entities/product.entity';
import { ProductVariant } from '../../../../apps/backend/src/modules/product/entities/product-variant.entity';

@Entity('order_items')
export class OrderItem extends BaseEntity {
  @Column()
  orderId: string;

  @Column()
  productId: string;

  @Column({ nullable: true })
  variantId: string;

  @Column()
  quantity: number;

  @Column()
  unitPrice: number;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => Product, (product) => product.orderItems)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ManyToOne(() => ProductVariant)
  @JoinColumn({ name: 'variantId' })
  variant: ProductVariant;
} 