import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ReviewServiceType } from './review-service-type.entity';

@Entity('review_service_type_translations')
@Unique(['locale', 'serviceTypeId'])
export class ReviewServiceTypeTranslation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 2 })
  locale!: string;

  @Column()
  name!: string;

  @Column({ name: 'service_type_id' })
  serviceTypeId!: number;

  @ManyToOne(() => ReviewServiceType, (serviceType) => serviceType.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'service_type_id' })
  serviceType!: ReviewServiceType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
} 