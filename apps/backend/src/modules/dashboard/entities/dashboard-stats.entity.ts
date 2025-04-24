import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('dashboard_stats')
export class DashboardStats {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  revenue: number;

  @Column({ name: 'revenue_change', type: 'decimal', precision: 5, scale: 2, default: 0 })
  revenueChange: number;

  @Column({ type: 'int', default: 0 })
  orders: number;

  @Column({ name: 'orders_change', type: 'decimal', precision: 5, scale: 2, default: 0 })
  ordersChange: number;

  @Column({ type: 'int', default: 0 })
  customers: number;

  @Column({ name: 'customers_change', type: 'decimal', precision: 5, scale: 2, default: 0 })
  customersChange: number;

  @Column({ name: 'conversion_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  conversionRate: number;

  @Column({ name: 'conversion_rate_change', type: 'decimal', precision: 5, scale: 2, default: 0 })
  conversionRateChange: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 