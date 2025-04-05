import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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

  @ManyToOne(() => Gallery, gallery => gallery.translations, {
    onDelete: 'CASCADE'
  })
  gallery: Gallery;
} 