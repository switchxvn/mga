import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AdminMenuItem } from './admin-menu-item.entity';

@Entity('admin_menu_item_translations')
export class AdminMenuItemTranslation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'admin_menu_item_id' })
  adminMenuItemId!: number;

  @Column({ length: 2 })
  locale!: string;

  @Column({ length: 100 })
  name!: string;

  @ManyToOne(() => AdminMenuItem, adminMenuItem => adminMenuItem.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'admin_menu_item_id' })
  adminMenuItem!: AdminMenuItem;
} 