import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProductAttributeValue } from './product-attribute-value.entity';

@Entity('product_attribute_value_translations')
export class ProductAttributeValueTranslation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'value_id' })
  valueId!: number;

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
  @ManyToOne(() => ProductAttributeValue, value => value.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'value_id' })
  value!: ProductAttributeValue;
} 