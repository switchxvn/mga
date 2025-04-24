import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Gallery } from './gallery.entity';

@Entity('gallery_translations')
export class GalleryTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 5 })
  locale: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'gallery_id' })
  galleryId: number;

  @ManyToOne(() => Gallery, gallery => gallery.translations, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'gallery_id' })
  gallery: Gallery;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 