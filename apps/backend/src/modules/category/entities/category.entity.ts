import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Post } from '../../post/entities/post.entity';
import { Product } from '../../product/entities/product.entity';
import { CategoryTranslation } from './category-translation.entity';
import { CategoryType } from '../../../../../../libs/shared/src/types/category.type';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ default: true })
  active!: boolean;

  @Column({ default: false, name: 'is_featured' })
  isFeatured!: boolean;

  // Thêm trường type để phân biệt loại category
  @Column({
    type: 'enum',
    enum: CategoryType,
    default: CategoryType.BOTH,
    name: 'category_type'
  })
  type!: CategoryType;

  // Parent-child relationship
  @Column({ name: 'parent_id', nullable: true })
  parentId!: number | null;

  @ManyToOne(() => Category, category => category.children)
  @JoinColumn({ name: 'parent_id' })
  parent!: Category | null;

  @OneToMany(() => Category, category => category.parent)
  children!: Category[];

  @OneToMany(() => CategoryTranslation, translation => translation.category)
  translations!: CategoryTranslation[];

  @ManyToMany(() => Post, (post) => post.categories)
  @JoinTable({
    name: 'post_categories',
    joinColumn: {
      name: 'category_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'post_id',
      referencedColumnName: 'id'
    }
  })
  posts!: Post[];

  @ManyToMany(() => Product, (product) => product.categories)
  products!: Product[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
} 