import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ThemeSection } from './theme-section.entity';
import { ComponentStyleConfig } from './component-style-config.entity';

type ColorShades = {
  '50': string;
  '100': string;
  '200': string;
  '300': string;
  '400': string;
  '500': string;
  '600': string;
  '700': string;
  '800': string;
  '900': string;
};

type ColorMode = {
  primary: ColorShades;
  secondary: ColorShades;
};

@Entity('themes')
export class Theme {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: 'jsonb', nullable: true })
  colors!: {
    light: ColorMode;
    dark: ColorMode;
  };

  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => ThemeSection, section => section.theme)
  sections!: ThemeSection[];

  @OneToMany(() => ComponentStyleConfig, config => config.theme)
  componentStyleConfigs!: ComponentStyleConfig[];
} 