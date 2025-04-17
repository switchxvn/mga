import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PaymentTransaction } from './payment-transaction.entity';

export interface PaymentMethodConfig {
  clientId?: string;
  apiKey?: string;
  checksumKey?: string;
  [key: string]: any; // Allow other configuration keys
}

@Entity('payment_methods')
export class PaymentMethod {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ type: 'jsonb', nullable: true })
  config: PaymentMethodConfig;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => PaymentTransaction, transaction => transaction.paymentMethod)
  transactions: PaymentTransaction[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
} 