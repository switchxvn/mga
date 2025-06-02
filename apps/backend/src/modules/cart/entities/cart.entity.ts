import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { CartItem } from './cart-item.entity';

@Entity('carts')
@Index(['userId'])
@Index(['sessionId'])
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string;

  @Column({ name: 'session_id', type: 'varchar', length: 255, nullable: true })
  sessionId?: string;

  @Column({ 
    name: 'expires_at', 
    type: 'timestamp',
    nullable: true,
    comment: 'Cart expiration time for guest users'
  })
  expiresAt?: Date;

  @OneToMany(() => CartItem, item => item.cart, { cascade: true })
  items: CartItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 