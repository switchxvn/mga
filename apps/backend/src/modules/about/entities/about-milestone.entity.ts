import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { AboutPage } from './about-page.entity';
import { AboutMilestoneTranslation } from './about-milestone-translation.entity';

@Entity('about_milestones')
export class AboutMilestone {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'about_page_id' })
  aboutPageId: number;

  @Column()
  year: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ default: 0 })
  order: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => AboutPage, aboutPage => aboutPage.milestones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'about_page_id' })
  aboutPage: AboutPage;

  @OneToMany(() => AboutMilestoneTranslation, translation => translation.aboutMilestone, { cascade: true })
  translations: AboutMilestoneTranslation[];
} 