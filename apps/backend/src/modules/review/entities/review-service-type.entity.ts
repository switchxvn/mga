import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReviewServiceTypeTranslation } from './review-service-type-translation.entity';
import { Review } from './review.entity';

@Entity('review_service_types')
export class ReviewServiceType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  slug!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => ReviewServiceTypeTranslation, (translation: ReviewServiceTypeTranslation) => translation.serviceType, {
    cascade: true,
    eager: true,
  })
  translations!: ReviewServiceTypeTranslation[];

  @OneToMany(() => Review, (review: Review) => review.serviceType)
  reviews!: Review[];

  // Utility getter methods for name in current locale
  get name(): string | undefined {
    return this.translations?.[0]?.name;
  }

  get locale(): string | undefined {
    return this.translations?.[0]?.locale;
  }
} 