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

  @ManyToOne(() => ContactSection, section => section.translations)
  @JoinColumn({ name: 'section_id' })
  section: ContactSection;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 