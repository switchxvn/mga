import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('customer_logos')
export class CustomerLogo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'image_url', length: 255 })
  imageUrl!: string;

  @Column({ length: 255 })
  alt!: string;

  @Column({ length: 255, nullable: true })
  link?: string;

  @Column({ type: 'int', default: 0 })
  order!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
} 