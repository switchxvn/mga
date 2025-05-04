import { 
  SiteStatistics, 
  SiteStatisticsSettings, 
  SiteStatisticsTranslation 
} from '../entities';

export interface ISiteStatisticsAdminService {
  getAllStatistics(): Promise<SiteStatistics[]>;
  getStatisticById(id: number): Promise<SiteStatistics>;
  getStatisticByKey(key: string): Promise<SiteStatistics>;
  createStatistic(data: Partial<SiteStatistics>): Promise<SiteStatistics>;
  updateStatistic(id: number, data: Partial<SiteStatistics>): Promise<SiteStatistics>;
  deleteStatistic(id: number): Promise<void>;
  incrementStatistic(key: string, amount?: number): Promise<SiteStatistics>;
  resetStatistic(key: string): Promise<SiteStatistics>;
  getSettings(): Promise<SiteStatisticsSettings>;
  updateSettings(data: Partial<SiteStatisticsSettings>): Promise<SiteStatisticsSettings>;
  updateTranslation(
    statisticId: number,
    locale: string,
    data: Partial<SiteStatisticsTranslation>
  ): Promise<SiteStatisticsTranslation>;
}

export interface ISiteStatisticsFrontendService {
  getSettings(): Promise<SiteStatisticsSettings>;
  getVisibleStatistics(locale?: string): Promise<SiteStatistics[]>;
  trackVisit(sessionId: string): Promise<void>;
  registerOnlineUser(sessionId: string): Promise<void>;
  resetDailyStatistics(): Promise<void>;
} 