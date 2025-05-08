import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Order } from './order.entity';
import { OrderRefundItem } from './order-refund-item.entity';

export enum RefundReason {
  CHANGE_MIND = 'CHANGE_MIND',
  PRODUCT_DEFECT = 'PRODUCT_DEFECT',
  WRONG_PRODUCT = 'WRONG_PRODUCT',
  SCHEDULE_CHANGE = 'SCHEDULE_CHANGE',
  OTHER = 'OTHER',
}

export enum RefundType {
  MONEY_REFUND = 'MONEY_REFUND',
  RESCHEDULE = 'RESCHEDULE',
  PRODUCT_EXCHANGE = 'PRODUCT_EXCHANGE',
  STORE_CREDIT = 'STORE_CREDIT',
}

export enum RefundStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('order_refunds')
export class OrderRefund {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id' })
  orderId: number;

  @Column({ name: 'refund_code', length: 50, unique: true })
  refundCode: string;

  @Column({ name: 'requester_name', length: 255 })
  requesterName: string;

  @Column({ name: 'requester_phone', length: 50 })
  requesterPhone: string;

  @Column({ name: 'requester_phone_code', length: 10, nullable: true })
  requesterPhoneCode?: string;

  @Column({ name: 'requester_email', length: 255, nullable: true })
  requesterEmail?: string;

  @Column({
    name: 'refund_reason',
    type: 'enum',
    enum: RefundReason
  })
  refundReason: RefundReason;

  @Column({
    name: 'refund_type',
    type: 'enum',
    enum: RefundType
  })
  refundType: RefundType;

  @Column({
    name: 'refund_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true
  })
  refundAmount?: number;

  @Column({
    type: 'enum',
    enum: RefundStatus,
    default: RefundStatus.PENDING
  })
  status: RefundStatus;

  @Column({ type: 'text', nullable: true })
  details?: string;

  @Column({ type: 'jsonb', nullable: true, name: 'additional_info' })
  additionalInfo?: Record<string, any>;

  @Column({ type: 'text', nullable: true, name: 'admin_notes' })
  adminNotes?: string;

  @Column({ name: 'requested_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  requestedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @OneToMany(() => OrderRefundItem, item => item.refund)
  items: OrderRefundItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 