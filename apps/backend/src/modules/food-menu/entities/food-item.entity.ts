import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { FoodCategory } from './food-category.entity';
import { FoodItemTranslation } from './food-item-translation.entity';

@Entity('food_items')
export class FoodItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ default: 0 })
  order: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'discount_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountPrice: number;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_spicy', default: false })
  isSpicy: boolean;

  @Column({ name: 'is_vegetarian', default: false })
  isVegetarian: boolean;

  @Column({ name: 'is_vegan', default: false })
  isVegan: boolean;

  @Column({ name: 'preparation_time', nullable: true })
  preparationTime: number;

  @Column({ nullable: true })
  calories: number;

  @Column({ type: 'jsonb', nullable: true })
  image: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  gallery: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => FoodCategory, (category) => category.items)
  @JoinColumn({ name: 'category_id' })
  category: FoodCategory;

  @OneToMany(() => FoodItemTranslation, (translation) => translation.item)
  translations: FoodItemTranslation[];
} 