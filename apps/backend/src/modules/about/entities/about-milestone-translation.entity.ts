import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AboutMilestone } from './about-milestone.entity';

@Entity('about_milestone_translations')
export class AboutMilestoneTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'about_milestone_id' })
  aboutMilestoneId: number;

  @Column({ name: 'language_code' })
  languageCode: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => AboutMilestone, milestone => milestone.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'about_milestone_id' })
  aboutMilestone: AboutMilestone;
} 