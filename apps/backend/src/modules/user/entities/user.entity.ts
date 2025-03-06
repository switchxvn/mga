import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { Post } from '../../post/entities/post.entity';
import { UserProfile } from '../../profile/entities/user-profile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'username', nullable: true })
  username!: string;

  @Column({ name: 'password', select: false })
  password!: string;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified!: boolean;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt!: Date;

  @Column({ nullable: true })
  bio!: string;

  @OneToMany(() => Post, post => post.author, { lazy: true })
  posts!: Promise<Post[]>;

  @OneToOne(() => UserProfile, profile => profile.user, { lazy: true })
  profile!: Promise<UserProfile>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
} 