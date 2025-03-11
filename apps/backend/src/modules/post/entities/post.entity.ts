import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, ManyToMany, OneToMany, JoinTable } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Category } from '../../category/entities/category.entity';
import { PostTag } from './post-tag.entity';
import { PostTranslation } from './post-translation.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  content!: string;

  @Column({ name: 'short_description', type: 'text', nullable: true })
  shortDescription!: string;

  @Column({ nullable: true })
  thumbnail!: string;

  @Column({ default: false })
  published!: boolean;

  @Column({ name: 'author_id' })
  authorId!: number;

  @ManyToOne(() => User, (user) => user.posts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'author_id' })
  author!: User;

  @OneToMany(() => PostTranslation, (translation) => translation.post, {
    cascade: true
  })
  translations!: PostTranslation[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToMany(() => Category, (category) => category.posts)
  @JoinTable({
    name: 'post_categories',
    joinColumn: {
      name: 'post_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'category_id',
      referencedColumnName: 'id'
    }
  })
  categories!: Category[];

  @OneToMany(() => PostTag, postTag => postTag.post)
  postTags!: PostTag[];
}