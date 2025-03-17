import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { AboutTeamMember } from './about-team-member.entity';

@Entity('about_team_member_translations')
export class AboutTeamMemberTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'about_team_member_id' })
  aboutTeamMemberId: number;

  @Column({ name: 'language_code' })
  languageCode: string;

  @Column()
  name: string;

  @Column()
  position: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => AboutTeamMember, member => member.translations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'about_team_member_id' })
  aboutTeamMember: AboutTeamMember;
} 