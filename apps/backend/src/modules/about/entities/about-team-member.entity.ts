import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AboutPage } from './about-page.entity';

@Entity('about_team_members')
export class AboutTeamMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'about_page_id' })
  aboutPageId: number;

  @Column()
  name: string;

  @Column()
  position: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'jsonb', nullable: true })
  social_links: Record<string, string>;

  @Column({ default: 0 })
  order: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => AboutPage, aboutPage => aboutPage.teamMembers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'about_page_id' })
  aboutPage: AboutPage;
} 