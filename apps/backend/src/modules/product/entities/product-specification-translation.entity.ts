import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ProductSpecification } from './product-specification.entity';

@Entity('product_specification_translations')
export class ProductSpecificationTranslation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'specification_id' })
  specificationId!: number;

  @Column({ length: 2 })
  locale!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  value!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => ProductSpecification, specification => specification.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'specification_id' })
  specification!: ProductSpecification;
} 