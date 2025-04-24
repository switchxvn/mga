import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProductAttribute } from './product-attribute.entity';

@Entity('product_attribute_translations')
export class ProductAttributeTranslation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'attribute_id' })
  attributeId!: number;

  @Column({ length: 5 })
  locale!: string;

  @Column({ nullable: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => ProductAttribute, attribute => attribute.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attribute_id' })
  attribute!: ProductAttribute;
} 