import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderTicketSection } from './order-ticket-section.entity';

@Entity('order_ticket_section_translations')
export class OrderTicketSectionTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'section_id' })
  sectionId: number;

  @Column({ length: 2 })
  locale: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  subtitle: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @ManyToOne(() => OrderTicketSection, section => section.translations)
  @JoinColumn({ name: 'section_id' })
  section: OrderTicketSection;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 