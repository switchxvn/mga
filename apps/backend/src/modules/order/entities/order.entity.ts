import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { CountryPhoneCode } from '../../common/entities/country-phone-code.entity';
import { OrderStatus, PaymentStatus, Address, OrderType } from '@ew/shared';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_code', type: 'varchar', length: 50, unique: true })
  orderCode: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string;

  @Column({ type: 'varchar', length: 10, name: 'phone_code' })
  phoneCode: string;

  @Column({ type: 'varchar', length: 10, name: 'phone_number' })
  phoneNumber: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ name: 'customer_name', nullable: true })
  customerName?: string;

  @ManyToOne(() => CountryPhoneCode)
  @JoinColumn({ name: 'phone_code', referencedColumnName: 'phoneCode' })
  countryPhoneCode: CountryPhoneCode;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: OrderType,
    default: OrderType.STANDARD,
    name: 'order_type'
  })
  orderType: OrderType;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_amount' })
  totalAmount: number;

  @Column({ type: 'jsonb', nullable: true, name: 'shipping_address' })
  shippingAddress?: Address;

  @Column({ type: 'jsonb', nullable: true, name: 'billing_address' })
  billingAddress?: Address;

  @Column({ nullable: true, name: 'payment_method' })
  paymentMethod: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
    name: 'payment_status'
  })
  paymentStatus: PaymentStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @OneToMany(() => OrderItem, item => item.order)
  items: OrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ nullable: true, name: 'exchange_for_order_id' })
  exchangeForOrderId: number;
} 