import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { FoodCategoryTranslation } from './food-category-translation.entity';
import { FoodItem } from './food-item.entity';

@Entity('food_categories')
export class FoodCategory {
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

  @Column({ type: 'jsonb', nullable: true })
  image: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @OneToMany(() => FoodCategoryTranslation, (translation) => translation.category)
  translations: FoodCategoryTranslation[];

  @OneToMany(() => FoodItem, (item) => item.category)
  items: FoodItem[];
} 