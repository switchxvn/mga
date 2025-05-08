import { 
  Column, 
  CreateDateColumn, 
  Entity, 
  PrimaryGeneratedColumn, 
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { SiteStatisticsTranslation } from './site-statistics-translation.entity';
import { SiteStatisticsHistory } from './site-statistics-history.entity';

@Entity('site_statistics')
export class SiteStatistics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  key: string;

  @Column({ length: 255 })
  value: string;

  @Column({ type: 'bigint', nullable: true })
  value_number: number;

  @Column({ length: 100 })
  display_name: string;

  @Column({ length: 50, nullable: true })
  icon: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  is_visible: boolean;

  @Column({ default: 0 })
  display_order: number;

  @Column({ nullable: true })
  last_reset: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => SiteStatisticsTranslation, translation => translation.statistic)
  translations: SiteStatisticsTranslation[];

  @OneToMany(() => SiteStatisticsHistory, history => history.statistic)
  history: SiteStatisticsHistory[];
} 