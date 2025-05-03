import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReviewTranslation } from './review-translation.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'author_name' })
  authorName!: string;

  @Column({ name: 'author_avatar', nullable: true })
  authorAvatar?: string;

  @Column()
  rating!: number;

  @Column({ name: 'service_type', nullable: true })
  serviceType?: string;

  @Column({ name: 'visit_date', type: 'date', nullable: true })
  visitDate?: Date;

  @Column({ default: false })
  featured!: boolean;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => ReviewTranslation, (translation) => translation.review, {
    cascade: true,
    eager: true,
  })
  translations!: ReviewTranslation[];

  // Utility getter methods for content in current locale
  get title(): string | undefined {
    return this.translations?.[0]?.title;
  }

  get content(): string | undefined {
    return this.translations?.[0]?.content;
  }

  get locale(): string | undefined {
    return this.translations?.[0]?.locale;
  }
} 