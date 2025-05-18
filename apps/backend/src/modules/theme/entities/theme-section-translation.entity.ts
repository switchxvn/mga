import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ThemeSection } from './theme-section.entity';
import { ThemeSectionTranslation as IThemeSectionTranslation } from '@ew/shared';

@Entity('theme_section_translations')
export class ThemeSectionTranslation implements IThemeSectionTranslation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'section_id' })
  sectionId!: number;

  @Column({ length: 2 })
  locale!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'jsonb', nullable: true })
  settings!: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => ThemeSection, section => section.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'section_id' })
  section!: ThemeSection;
} 