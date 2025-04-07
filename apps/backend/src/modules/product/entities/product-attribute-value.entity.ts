import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ProductAttribute } from './product-attribute.entity';
import { ProductAttributeValueTranslation } from './product-attribute-value-translation.entity';

@Entity('product_attribute_values')
export class ProductAttributeValue {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'attribute_id' })
  attributeId!: number;

  @Column({ nullable: true })
  code!: string;

  @Column({ default: true })
  published!: boolean;

  @Column({ default: 0 })
  position!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => ProductAttribute, attribute => attribute.values, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attribute_id' })
  attribute!: ProductAttribute;

  @OneToMany(() => ProductAttributeValueTranslation, translation => translation.value, { cascade: true })
  translations!: ProductAttributeValueTranslation[];
} 