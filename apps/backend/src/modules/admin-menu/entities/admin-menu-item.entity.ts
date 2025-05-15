import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { AdminMenuItemTranslation } from './admin-menu-item-translation.entity';

@Entity('admin_menu_items')
export class AdminMenuItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50, unique: true })
  code!: string;

  @Column({ length: 50, nullable: true })
  icon!: string;

  @Column({ name: 'icon_type', length: 20, default: 'lucide' })
  iconType!: string;

  @Column({ length: 255, nullable: true })
  path!: string;

  @Column({ name: 'parent_id', nullable: true })
  parentId!: number | null;

  @Column({ default: 0 })
  order!: number;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'available_for_roles', length: 255, nullable: true })
  availableForRoles!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => AdminMenuItem, item => item.children)
  @JoinColumn({ name: 'parent_id' })
  parent!: AdminMenuItem | null;

  @OneToMany(() => AdminMenuItem, item => item.parent)
  children!: AdminMenuItem[];
  
  @OneToMany(() => AdminMenuItemTranslation, translation => translation.adminMenuItem, { cascade: true })
  translations!: AdminMenuItemTranslation[];
} 