import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { MenuItem } from './menu-item.entity';

@Entity('menu_item_translations')
export class MenuItemTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  label: string;

  @Column()
  href: string;

  @Column({ length: 2 })
  locale: string;

  @Column({ name: 'menu_item_id' })
  menuItemId: number;

  @ManyToOne(() => MenuItem, menuItem => menuItem.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_item_id' })
  menuItem: MenuItem;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 