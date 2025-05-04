import { 
  Column, 
  CreateDateColumn, 
  Entity, 
  JoinColumn, 
  ManyToOne, 
  PrimaryGeneratedColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { SiteStatistics } from './site-statistics.entity';

@Entity('site_statistics_translations')
export class SiteStatisticsTranslation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  statistic_id: number;

  @Column({ length: 5 })
  locale: string;

  @Column({ length: 100 })
  display_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => SiteStatistics, statistic => statistic.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'statistic_id' })
  statistic: SiteStatistics;
} 