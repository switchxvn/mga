import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ProductAttributeTranslation } from './product-attribute-translation.entity';
import { ProductAttributeValue } from './product-attribute-value.entity';

@Entity('product_attributes')
export class ProductAttribute {
  @PrimaryGeneratedColumn()
  id!: number;

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
  @OneToMany(() => ProductAttributeTranslation, translation => translation.attribute, { cascade: true })
  translations!: ProductAttributeTranslation[];

  @OneToMany(() => ProductAttributeValue, value => value.attribute, { cascade: true })
  values!: ProductAttributeValue[];
} 