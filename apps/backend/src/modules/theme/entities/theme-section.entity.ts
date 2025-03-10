import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Theme } from './theme.entity';

@Entity('theme_sections')
export class ThemeSection {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'theme_id' })
  themeId!: number;

  @Column({ length: 50 })
  type!: string;

  @Column()
  title!: string;

  @Column({ type: 'int', default: 0 })
  order!: number;

  @Column({ type: 'jsonb', default: {} })
  settings!: Record<string, any>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Theme, theme => theme.sections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'theme_id' })
  theme!: Theme;
} 