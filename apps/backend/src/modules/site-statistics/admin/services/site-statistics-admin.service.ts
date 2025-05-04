import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { 
  SiteStatistics, 
  SiteStatisticsHistory, 
  SiteStatisticsSettings, 
  SiteStatisticsTranslation 
} from '../../entities';

@Injectable()
export class SiteStatisticsAdminService {
  constructor(
    @InjectRepository(SiteStatistics)
    private readonly statisticsRepository: Repository<SiteStatistics>,
    
    @InjectRepository(SiteStatisticsHistory)
    private readonly historyRepository: Repository<SiteStatisticsHistory>,
    
    @InjectRepository(SiteStatisticsTranslation)
    private readonly translationRepository: Repository<SiteStatisticsTranslation>,
    
    @InjectRepository(SiteStatisticsSettings)
    private readonly settingsRepository: Repository<SiteStatisticsSettings>,
  ) {}

  async getAllStatistics(): Promise<SiteStatistics[]> {
    return this.statisticsRepository.find({
      order: { display_order: 'ASC' },
      relations: ['translations'],
    });
  }

  async getStatisticById(id: number): Promise<SiteStatistics> {
    return this.statisticsRepository.findOne({
      where: { id },
      relations: ['translations', 'history'],
    });
  }

  async getStatisticByKey(key: string): Promise<SiteStatistics> {
    return this.statisticsRepository.findOne({
      where: { key },
      relations: ['translations'],
    });
  }

  async createStatistic(data: Partial<SiteStatistics>): Promise<SiteStatistics> {
    const statistic = this.statisticsRepository.create(data);
    return this.statisticsRepository.save(statistic);
  }

  async updateStatistic(id: number, data: Partial<SiteStatistics>): Promise<SiteStatistics> {
    await this.statisticsRepository.update(id, data);
    return this.getStatisticById(id);
  }

  async deleteStatistic(id: number): Promise<void> {
    await this.statisticsRepository.delete(id);
  }

  async incrementStatistic(key: string, amount: number = 1): Promise<SiteStatistics> {
    const statistic = await this.getStatisticByKey(key);
    if (!statistic) {
      throw new Error(`Statistic with key ${key} not found`);
    }

    // Đảm bảo valueNumber là số bằng cách chuyển đổi tường minh
    const currentValue = typeof statistic.value_number === 'number' 
      ? statistic.value_number 
      : parseInt(String(statistic.value_number || '0'), 10);
    
    // Tính toán giá trị mới
    const valueNumber = currentValue + amount;
    // Chuyển thành chuỗi sau khi đã tính toán
    const value = valueNumber.toString();

    console.log(`Incrementing ${key} from ${currentValue} to ${valueNumber}`);

    await this.statisticsRepository.update(statistic.id, {
      value,
      value_number: valueNumber,
    });

    return this.getStatisticByKey(key);
  }

  async resetStatistic(key: string): Promise<SiteStatistics> {
    const statistic = await this.getStatisticByKey(key);
    if (!statistic) {
      throw new Error(`Statistic with key ${key} not found`);
    }

    // Lưu giá trị hiện tại vào lịch sử
    const history = this.historyRepository.create({
      statistic_id: statistic.id,
      value: statistic.value,
      value_number: statistic.value_number,
      period_type: 'reset',
    });
    await this.historyRepository.save(history);

    // Reset về 0
    await this.statisticsRepository.update(statistic.id, {
      value: '0',
      value_number: 0,
      last_reset: new Date(),
    });

    return this.getStatisticByKey(key);
  }

  async getSettings(): Promise<SiteStatisticsSettings> {
    const settings = await this.settingsRepository.findOne({
      where: { id: 1 },
    });
    return settings || await this.createDefaultSettings();
  }

  async updateSettings(data: Partial<SiteStatisticsSettings>): Promise<SiteStatisticsSettings> {
    const settings = await this.getSettings();
    await this.settingsRepository.update(settings.id, data);
    return this.getSettings();
  }

  private async createDefaultSettings(): Promise<SiteStatisticsSettings> {
    const defaultSettings = this.settingsRepository.create({
      is_enabled: true,
      display_in_footer: true,
      display_items: ['total_visits', 'daily_visits', 'online_users', 'total_registered_users'],
      style_settings: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        textColor: '#ffffff',
        iconColor: '#ffffff',
        valueColor: '#ffffff',
        titleColor: '#ffffff',
        borderRadius: '0.5rem',
        padding: '1rem',
        iconSize: '1.5rem',
        fontSize: '0.875rem',
        valueFontSize: '1.25rem',
        titleFontSize: '0.75rem',
        gap: '0.5rem',
      },
    });
    return this.settingsRepository.save(defaultSettings);
  }

  async updateTranslation(
    statisticId: number, 
    locale: string, 
    data: Partial<SiteStatisticsTranslation>
  ): Promise<SiteStatisticsTranslation> {
    let translation = await this.translationRepository.findOne({
      where: { statistic_id: statisticId, locale },
    });

    if (translation) {
      await this.translationRepository.update(translation.id, data);
    } else {
      translation = this.translationRepository.create({
        statistic_id: statisticId,
        locale,
        ...data,
      });
      await this.translationRepository.save(translation);
    }

    return translation;
  }
} 