import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { GalleryTranslation } from './gallery-translation.entity';

export enum GalleryType {
  COMMON = 'common',
  FOOD = 'food'
}

@Entity('galleries')
export class Gallery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  image: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: GalleryType.COMMON,
    enum: GalleryType
  })
  type: GalleryType;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  sequence: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP', name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => GalleryTranslation, translation => translation.gallery, {
    cascade: ['insert', 'update', 'remove'],
    eager: true
  })
  translations: GalleryTranslation[];
} 