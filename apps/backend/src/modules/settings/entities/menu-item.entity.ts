import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { MenuItemTranslation } from './menu-item-translation.entity';

@Entity('menu_items')
export class MenuItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'default_locale', length: 2, default: 'en' })
  defaultLocale: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ default: 0 })
  order: number;

  @Column({ default: 0 })
  level: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'parent_id', nullable: true })
  parentId: number | null;

  @ManyToOne(() => MenuItem, menuItem => menuItem.children, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent: MenuItem | null;

  @OneToMany(() => MenuItem, (menuItem) => menuItem.parent)
  children: MenuItem[];

  @OneToMany(() => MenuItemTranslation, (translation) => translation.menuItem)
  translations: MenuItemTranslation[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 