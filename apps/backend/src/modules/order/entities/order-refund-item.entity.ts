import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { OrderRefund } from './order-refund.entity';

@Entity('order_refund_items')
export class OrderRefundItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'refund_id' })
  refundId: number;

  @Column({ name: 'order_item_id' })
  orderItemId: number;

  @Column({ default: 1 })
  quantity: number;

  @Column({
    name: 'refund_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true
  })
  refundAmount?: number;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ name: 'new_date', type: 'date', nullable: true })
  newDate?: string;

  @ManyToOne(() => OrderRefund, refund => refund.items)
  @JoinColumn({ name: 'refund_id' })
  refund: OrderRefund;

  @ManyToOne(() => OrderItem)
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 