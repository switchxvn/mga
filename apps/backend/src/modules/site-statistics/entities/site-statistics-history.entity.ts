import { 
  Column, 
  CreateDateColumn, 
  Entity, 
  JoinColumn, 
  ManyToOne, 
  PrimaryGeneratedColumn 
} from 'typeorm';
import { SiteStatistics } from './site-statistics.entity';

@Entity('site_statistics_history')
export class SiteStatisticsHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  statistic_id: number;

  @Column({ length: 255 })
  value: string;

  @Column({ type: 'bigint', nullable: true })
  value_number: number;

  @CreateDateColumn({ name: 'recorded_at' })
  recorded_at: Date;

  @Column({ length: 20 })
  period_type: string;

  @ManyToOne(() => SiteStatistics, statistic => statistic.history, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'statistic_id' })
  statistic: SiteStatistics;
} 