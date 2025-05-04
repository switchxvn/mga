import { 
  Column, 
  CreateDateColumn, 
  Entity, 
  PrimaryGeneratedColumn, 
  UpdateDateColumn 
} from 'typeorm';

@Entity('site_statistics_settings')
export class SiteStatisticsSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: true })
  is_enabled: boolean;

  @Column({ default: true })
  display_in_footer: boolean;

  @Column({ type: 'json', nullable: true })
  display_items: string[];

  @Column({ type: 'json', nullable: true })
  style_settings: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  creator_id: number;

  @Column({ nullable: true })
  updater_id: number;
} 