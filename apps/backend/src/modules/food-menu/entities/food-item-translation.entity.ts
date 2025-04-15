import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { FoodItem } from './food-item.entity';

@Entity('food_items_translations')
export class FoodItemTranslation {
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

  @Column('text', { array: true, nullable: true })
  ingredients: string[];

  @Column('text', { array: true, nullable: true })
  allergens: string[];

  @Column({ name: 'language_code' })
  languageCode: string;

  @Column({ name: 'item_id' })
  itemId: string;

  @ManyToOne(() => FoodItem, (item) => item.translations)
  @JoinColumn({ name: 'item_id' })
  item: FoodItem;
} 