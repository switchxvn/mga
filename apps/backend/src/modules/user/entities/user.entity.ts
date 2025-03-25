import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, ManyToMany, JoinTable } from 'typeorm';
import { Post } from '../../post/entities/post.entity';
import { UserProfile } from '../../profile/entities/user-profile.entity';
import { Role } from './role.entity';
import { Permission } from './permission.entity';

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

  @OneToMany(() => Post, post => post.author, { lazy: true })
  posts!: Promise<Post[]>;

  @OneToOne(() => UserProfile, profile => profile.user, { lazy: true })
  profile!: Promise<UserProfile>;

  @ManyToMany(() => Role, role => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id'
    }
  })
  roles!: Role[];

  @ManyToMany(() => Permission, permission => permission.users)
  @JoinTable({
    name: 'user_permissions',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id'
    }
  })
  permissions!: Permission[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
} 