import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Index, OneToMany } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { UserPageVisit } from './user-page-visit.entity';

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: true })
  userId: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ name: 'session_id' })
  @Index({ unique: true })
  sessionId: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string | null;

  @Column({ name: 'country', nullable: true })
  country: string | null;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string | null;

  @Column({ name: 'device_info', type: 'json', nullable: true })
  deviceInfo: Record<string, any> | null;

  @Column({ name: 'start_time', type: 'timestamp' })
  startTime: Date;

  @Column({ name: 'last_activity', type: 'timestamp' })
  lastActivity: Date;

  @Column({ name: 'expire_at', type: 'timestamp', nullable: true })
  expireAt: Date | null;

  @Column({ name: 'total_time', default: 0 })
  totalTime: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => UserPageVisit, pageVisit => pageVisit.session)
  pageVisits: UserPageVisit[];

  @Column({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
} 