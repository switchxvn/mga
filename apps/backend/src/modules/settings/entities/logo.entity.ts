import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('logos')
export class Logo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'dark_mode_url', nullable: true })
  darkModeUrl: string;

  @Column({ name: 'light_mode_url', nullable: true })
  lightModeUrl: string;

  @Column({ name: 'alt_text', nullable: true })
  altText: string;

  @Column({ default: 'main' })
  type: string; // main, mobile, favicon, etc.

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ nullable: true })
  width: number;

  @Column({ nullable: true })
  height: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 