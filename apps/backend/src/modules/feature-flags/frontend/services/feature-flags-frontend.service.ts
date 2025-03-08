import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureFlag } from '../../entities/feature-flag.entity';

@Injectable()
export class FeatureFlagsFrontendService {
  constructor(
    @InjectRepository(FeatureFlag)
    private featureFlagRepository: Repository<FeatureFlag>,
  ) {}

  /**
   * Lấy tất cả các feature flag
   * @returns Danh sách feature flag
   */
  async findAll(): Promise<FeatureFlag[]> {
    return this.featureFlagRepository.find();
  }

  /**
   * Lấy feature flag theo key
   * @param key Key của feature flag
   * @returns Feature flag hoặc null nếu không tìm thấy
   */
  async findByKey(key: string): Promise<FeatureFlag | null> {
    return this.featureFlagRepository.findOne({ where: { key } });
  }

  /**
   * Lấy feature flag theo group
   * @param group Group của feature flag
   * @returns Danh sách feature flag
   */
  async findByGroup(group: string): Promise<FeatureFlag[]> {
    return this.featureFlagRepository.find({ where: { group } });
  }

  /**
   * Kiểm tra xem feature có được bật hay không
   * @param key Key của feature
   * @param defaultValue Giá trị mặc định nếu không tìm thấy
   * @returns true nếu feature được bật, false nếu không
   */
  async isFeatureEnabled(key: string, defaultValue: boolean = true): Promise<boolean> {
    const featureFlag = await this.findByKey(key);
    return featureFlag ? featureFlag.enabled : defaultValue;
  }
} 