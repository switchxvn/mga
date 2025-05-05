import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { GalleryTranslation } from './gallery-translation.entity';
import { Category } from '../../category/entities/category.entity';
import { GalleryType } from '@ew/shared';

@Entity('galleries')
export class Gallery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  image: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  sequence: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'enum', enum: GalleryType, default: GalleryType.COMMON })
  type: GalleryType;

  @OneToMany(() => GalleryTranslation, translation => translation.gallery, {
    cascade: ['insert', 'update', 'remove'],
    eager: true
  })
  translations: GalleryTranslation[];

  @ManyToMany(() => Category)
  @JoinTable({
    name: 'gallery_categories',
    joinColumn: {
      name: 'gallery_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id'
    }
  })
  categories: Category[];
} 