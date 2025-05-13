import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Index } from 'typeorm';
import { UserSession } from './user-session.entity';

@Entity('user_page_visits')
export class UserPageVisit {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'session_id' })
  @Index()
  sessionId: string;

  @ManyToOne(() => UserSession, session => session.pageVisits)
  @JoinColumn({ name: 'session_id', referencedColumnName: 'sessionId' })
  session: UserSession;

  @Column({ name: 'page_url' })
  pageUrl: string;

  @Column({ name: 'referrer', nullable: true })
  referrer: string | null;

  @Column({ name: 'entry_time', type: 'timestamp' })
  entryTime: Date;

  @Column({ name: 'exit_time', type: 'timestamp', nullable: true })
  exitTime: Date | null;

  @Column({ name: 'time_on_page', default: 0 })
  timeOnPage: number;

  @Column({ name: 'is_landing_page', default: false })
  isLandingPage: boolean;

  @Column({ name: 'is_exit_page', default: false })
  isExitPage: boolean;

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
} 