import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { 
  SiteStatistics, 
  SiteStatisticsHistory, 
  SiteStatisticsSettings 
} from '../../entities';

@Injectable()
export class SiteStatisticsFrontendService {
  private readonly logger = new Logger(SiteStatisticsFrontendService.name);
  private onlineUsers: Set<string> = new Set<string>();
  private sessionTimeout: Map<string, NodeJS.Timeout> = new Map();
  private SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 phút

  constructor(
    @InjectRepository(SiteStatistics)
    private readonly statisticsRepository: Repository<SiteStatistics>,
    
    @InjectRepository(SiteStatisticsHistory)
    private readonly historyRepository: Repository<SiteStatisticsHistory>,
    
    @InjectRepository(SiteStatisticsSettings)
    private readonly settingsRepository: Repository<SiteStatisticsSettings>,
  ) {
    // Khởi tạo online users counter
    this.initOnlineUsersCounter();
  }

  private async initOnlineUsersCounter(): Promise<void> {
    try {
      // Reset online users mỗi khi khởi động lại server
      const onlineUsersStatistic = await this.statisticsRepository.findOne({
        where: { key: 'online_users' },
      });
      
      if (onlineUsersStatistic) {
        await this.statisticsRepository.update(onlineUsersStatistic.id, {
          value: '0',
          value_number: 0,
        });
      }
    } catch (error) {
      this.logger.error('Error initializing online users counter', error);
    }
  }

  async getSettings(): Promise<SiteStatisticsSettings> {
    try {
      const settings = await this.settingsRepository.findOne({
        where: { id: 1 },
      });
      return settings;
    } catch (error) {
      this.logger.error('Error getting site statistics settings', error);
      return null;
    }
  }

  async getVisibleStatistics(locale: string = 'vi'): Promise<SiteStatistics[]> {
    try {
      const settings = await this.getSettings();
      if (!settings || !settings.is_enabled) {
        return [];
      }

      let query = this.statisticsRepository.createQueryBuilder('stat')
        .leftJoinAndSelect(
          'stat.translations',
          'translations',
          'translations.locale = :locale',
          { locale }
        )
        .where('stat.is_visible = :isVisible', { isVisible: true })
        .orderBy('stat.display_order', 'ASC');

      if (settings.display_items && settings.display_items.length > 0) {
        query = query.andWhere('stat.key IN (:...keys)', { keys: settings.display_items });
      }

      return query.getMany();
    } catch (error) {
      this.logger.error('Error getting visible statistics', error);
      return [];
    }
  }

  async trackVisit(sessionId: string): Promise<void> {
    try {
      // Tăng tổng lượt truy cập
      await this.incrementStatistic('total_visits');
      
      // Tăng lượt truy cập hôm nay
      await this.incrementStatistic('daily_visits');
      
      // Đánh dấu người dùng đang trực tuyến
      await this.registerOnlineUser(sessionId);
    } catch (error) {
      this.logger.error('Error tracking visit', error);
    }
  }

  async registerOnlineUser(sessionId: string): Promise<void> {
    try {
      // Nếu người dùng đã được đánh dấu, xóa timeout cũ
      if (this.sessionTimeout.has(sessionId)) {
        clearTimeout(this.sessionTimeout.get(sessionId));
      }

      // Thêm người dùng vào set nếu chưa có
      const isNewUser = !this.onlineUsers.has(sessionId);
      this.onlineUsers.add(sessionId);

      // Tạo timeout mới để xóa session nếu không hoạt động
      const timeout = setTimeout(() => {
        this.unregisterOnlineUser(sessionId);
      }, this.SESSION_TIMEOUT_MS);
      
      this.sessionTimeout.set(sessionId, timeout);

      // Cập nhật thống kê chỉ khi có người dùng mới
      if (isNewUser) {
        const onlineUsersCount = this.onlineUsers.size;
        const onlineUsersStatistic = await this.statisticsRepository.findOne({
          where: { key: 'online_users' },
        });
        
        if (onlineUsersStatistic) {
          await this.statisticsRepository.update(onlineUsersStatistic.id, {
            value: onlineUsersCount.toString(),
            value_number: onlineUsersCount,
          });
        }
      }
    } catch (error) {
      this.logger.error('Error registering online user', error);
    }
  }

  private async unregisterOnlineUser(sessionId: string): Promise<void> {
    try {
      // Xóa khỏi set và map
      this.onlineUsers.delete(sessionId);
      this.sessionTimeout.delete(sessionId);

      // Cập nhật thống kê
      const onlineUsersCount = this.onlineUsers.size;
      const onlineUsersStatistic = await this.statisticsRepository.findOne({
        where: { key: 'online_users' },
      });
      
      if (onlineUsersStatistic) {
        await this.statisticsRepository.update(onlineUsersStatistic.id, {
          value: onlineUsersCount.toString(),
          value_number: onlineUsersCount,
        });
      }
    } catch (error) {
      this.logger.error('Error unregistering online user', error);
    }
  }

  private async incrementStatistic(key: string, amount: number = 1): Promise<void> {
    try {
      const statistic = await this.statisticsRepository.findOne({
        where: { key },
      });

      if (statistic) {
        const valueNumber = (statistic.value_number || 0) + amount;
        const value = valueNumber.toString();

        await this.statisticsRepository.update(statistic.id, {
          value,
          value_number: valueNumber,
        });
      }
    } catch (error) {
      this.logger.error(`Error incrementing statistic ${key}`, error);
    }
  }

  async resetDailyStatistics(): Promise<void> {
    try {
      // Lấy thống kê hàng ngày
      const dailyVisits = await this.statisticsRepository.findOne({
        where: { key: 'daily_visits' },
      });

      if (dailyVisits) {
        // Lưu giá trị hiện tại vào lịch sử
        const history = this.historyRepository.create({
          statistic_id: dailyVisits.id,
          value: dailyVisits.value,
          value_number: dailyVisits.value_number,
          period_type: 'daily',
        });
        await this.historyRepository.save(history);

        // Reset về 0
        await this.statisticsRepository.update(dailyVisits.id, {
          value: '0',
          value_number: 0,
          last_reset: new Date(),
        });
      }
    } catch (error) {
      this.logger.error('Error resetting daily statistics', error);
    }
  }
} 