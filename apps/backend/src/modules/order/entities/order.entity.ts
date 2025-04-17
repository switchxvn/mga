import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { CountryPhoneCode } from '../../common/entities/country-phone-code.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export interface Address {
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', nullable: true })
  userId?: string;

  @Column()
  phoneCode: string;

  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  email?: string;

  @ManyToOne(() => CountryPhoneCode)
  @JoinColumn({ name: 'phone_code', referencedColumnName: 'phoneCode' })
  countryPhoneCode: CountryPhoneCode;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'jsonb', nullable: true })
  shippingAddress?: Address;

  @Column({ type: 'jsonb', nullable: true })
  billingAddress?: Address;

  @Column()
  paymentMethod: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING
  })
  paymentStatus: PaymentStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @OneToMany(() => OrderItem, item => item.order)
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 