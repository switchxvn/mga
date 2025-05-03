import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Post } from '../../post/entities/post.entity';

export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SPAM = 'spam',
}

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  content!: string;

  @Column({ name: 'post_id' })
  postId!: number;

  @ManyToOne(() => Post, (post) => post.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post!: Post;

  @Column({ name: 'user_id', nullable: true })
  userId!: string | null;

  @ManyToOne(() => User, (user) => user.comments, {
    onDelete: 'SET NULL', 
    nullable: true,
  })
  @JoinColumn({ name: 'user_id' })
  user!: User | null;

  @Column({ name: 'parent_id', nullable: true })
  parentId!: number | null;

  @ManyToOne(() => Comment, (comment) => comment.replies, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent!: Comment | null;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies!: Comment[];

  @Column({ name: 'author_name', nullable: true })
  authorName!: string | null;

  @Column({ name: 'author_email', nullable: true })
  authorEmail!: string | null;

  @Column({
    type: 'enum',
    enum: CommentStatus,
    default: CommentStatus.PENDING,
  })
  status!: CommentStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
} 