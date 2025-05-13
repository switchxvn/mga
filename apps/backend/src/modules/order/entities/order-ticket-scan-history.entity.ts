import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { User } from '../../user/entities/user.entity';

@Entity('order_ticket_scan_history')
export class OrderTicketScanHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_item_id' })
  orderItemId: number;

  @Column({ name: 'scanned_by', type: 'uuid' })
  scannedBy: string;

  @Column({ name: 'scanned_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  scannedAt: Date;

  @Column({ nullable: true, length: 255 })
  location: string;

  @Column({ name: 'device_info', type: 'jsonb', nullable: true })
  deviceInfo: Record<string, any>;

  @Column({ name: 'is_first_scan', type: 'boolean', default: false })
  isFirstScan: boolean;

  @ManyToOne(() => OrderItem)
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'scanned_by', referencedColumnName: 'id' })
  scanner: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 