import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { FoodCategory } from './food-category.entity';

@Entity('food_categories_translations')
export class FoodCategoryTranslation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  slug: string;

  @Column({ name: 'meta_title', nullable: true })
  metaTitle: string;

  @Column({ name: 'meta_description', type: 'text', nullable: true })
  metaDescription: string;

  @Column({ name: 'language_code' })
  languageCode: string;

  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => FoodCategory, (category) => category.translations)
  @JoinColumn({ name: 'category_id' })
  category: FoodCategory;
} 