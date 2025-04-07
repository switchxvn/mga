import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ProductVariant } from './product-variant.entity';

@Entity('product_variant_translations')
export class ProductVariantTranslation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'variant_id' })
  variantId!: number;

  @Column({ length: 5 })
  locale!: string;

  @Column({ nullable: true })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'text', nullable: true, name: 'short_description' })
  shortDescription!: string;

  @Column({ nullable: true })
  metaTitle!: string;

  @Column({ type: 'text', nullable: true })
  metaDescription!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @ManyToOne(() => ProductVariant, variant => variant.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variant_id' })
  variant!: ProductVariant;
} 