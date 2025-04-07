import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Product } from './product.entity';
import { ProductVariantTranslation } from './product-variant-translation.entity';
import { ProductAttributeValue } from './product-attribute-value.entity';

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'product_id' })
  productId!: number;

  @Column({ nullable: true })
  sku!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'compare_price' })
  comparePrice!: number | null;

  @Column({ nullable: true })
  thumbnail!: string;

  @Column({ type: 'json', nullable: true })
  gallery!: string[];

  @Column({ default: true })
  published!: boolean;

  @Column({ default: 0 })
  quantity!: number;

  @Column({ name: 'is_featured', default: false })
  isFeatured!: boolean;

  @Column({ name: 'is_new', default: false })
  isNew!: boolean;

  @Column({ name: 'is_sale', default: false })
  isSale!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => Product, product => product.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @OneToMany(() => ProductVariantTranslation, translation => translation.variant, { cascade: true })
  translations!: ProductVariantTranslation[];

  @ManyToMany(() => ProductAttributeValue)
  @JoinTable({
    name: 'product_variant_attribute_values',
    joinColumn: {
      name: 'variant_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'value_id',
      referencedColumnName: 'id'
    }
  })
  attributeValues!: ProductAttributeValue[];
} 