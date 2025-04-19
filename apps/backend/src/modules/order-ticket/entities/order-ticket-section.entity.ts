import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { OrderTicketSectionTranslation } from './order-ticket-section-translation.entity';

export enum OrderTicketSectionType {
  BANNER = 'banner',
  INTRODUCE = 'introduce',
  TICKET_ORDER = 'ticket_order'
}

@Entity('order_ticket_sections')
export class OrderTicketSection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: OrderTicketSectionType,
    default: OrderTicketSectionType.BANNER
  })
  type: OrderTicketSectionType;

  @Column({ length: 100, name: 'component_name' })
  componentName: string;

  @Column({ default: 0, name: 'order' })
  order: number;

  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, any>;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @OneToMany(() => OrderTicketSectionTranslation, translation => translation.section)
  translations: OrderTicketSectionTranslation[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 