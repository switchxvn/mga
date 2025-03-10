import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ThemeSection } from './theme-section.entity';

@Entity('themes')
export class Theme {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: 'jsonb', nullable: true })
  colors!: {
    primary: Record<string, string>;
    secondary: Record<string, string>;
    success: Record<string, string>;
    error: Record<string, string>;
    warning: Record<string, string>;
    info: Record<string, string>;
  };

  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => ThemeSection, section => section.theme)
  sections!: ThemeSection[];
} 