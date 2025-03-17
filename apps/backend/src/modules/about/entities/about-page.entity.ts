import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { AboutSection } from './about-section.entity';
import { AboutTeamMember } from './about-team-member.entity';
import { AboutMilestone } from './about-milestone.entity';
import { AboutPageTranslation } from './about-page-translation.entity';

@Entity('about_page')
export class AboutPage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  subtitle: string;

  @Column({ name: 'meta_title', nullable: true })
  metaTitle: string;

  @Column({ name: 'meta_description', nullable: true })
  metaDescription: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => AboutSection, section => section.aboutPage, { cascade: true })
  sections: AboutSection[];

  @OneToMany(() => AboutTeamMember, member => member.aboutPage, { cascade: true })
  teamMembers: AboutTeamMember[];

  @OneToMany(() => AboutMilestone, milestone => milestone.aboutPage, { cascade: true })
  milestones: AboutMilestone[];

  @OneToMany(() => AboutPageTranslation, translation => translation.aboutPage, { cascade: true })
  translations: AboutPageTranslation[];
} 