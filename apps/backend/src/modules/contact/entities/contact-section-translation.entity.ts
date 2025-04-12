import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContactSection } from './contact-section.entity';

@Entity('contact_section_translations')
export class ContactSectionTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 10 })
  locale: string;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 255, nullable: true })
  subtitle: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @ManyToOne(() => ContactSection, section => section.translations)
  @JoinColumn({ name: 'section_id' })
  section: ContactSection;

  @Column({ name: 'section_id' })
  sectionId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 