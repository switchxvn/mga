import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { TicketPricingSectionTranslation } from './ticket-pricing-section-translation.entity';

export enum TicketPricingSectionType {
  HERO = 'hero',
  PRICING_TABLE = 'pricing_table',
  BENEFITS = 'benefits',
  FAQ = 'faq',
  CTA = 'cta'
}

@Entity('ticket_pricing_sections')
export class TicketPricingSection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: TicketPricingSectionType,
    default: TicketPricingSectionType.PRICING_TABLE
  })
  type: TicketPricingSectionType;

  @Column({ length: 100, name: 'component_name' })
  componentName: string;

  @Column({ default: 0, name: 'order' })
  order: number;

  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, any>;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @OneToMany(() => TicketPricingSectionTranslation, translation => translation.section)
  translations: TicketPricingSectionTranslation[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 