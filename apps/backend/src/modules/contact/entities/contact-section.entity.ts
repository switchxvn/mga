import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ContactSectionTranslation } from './contact-section-translation.entity';

export enum ContactSectionType {
  HERO = 'hero',
  CONTACT_FORM = 'contact_form',
  MAP = 'map',
  BRANCH_CONTACT = 'branch_contact',
  FAQ = 'faq',
  SOCIAL_MEDIA = 'social_media'
}

@Entity('contact_sections')
export class ContactSection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ContactSectionType,
    default: ContactSectionType.CONTACT_FORM
  })
  type: ContactSectionType;

  @Column({ length: 100, name: 'component_name' })
  componentName: string;

  @Column({ default: 0, name: 'order' })
  order: number;

  @Column({ type: 'jsonb', default: {} })
  settings: Record<string, any>;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @OneToMany(() => ContactSectionTranslation, translation => translation.section)
  translations: ContactSectionTranslation[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 