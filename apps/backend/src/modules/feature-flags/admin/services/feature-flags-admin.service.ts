import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureFlag } from '../../entities/feature-flag.entity';

@Injectable()
export class FeatureFlagsAdminService {
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
   * Tạo feature flag mới
   * @param data Dữ liệu feature flag
   * @returns Feature flag đã tạo
   */
  async create(data: Partial<FeatureFlag>): Promise<FeatureFlag> {
    const featureFlag = this.featureFlagRepository.create(data);
    return this.featureFlagRepository.save(featureFlag);
  }

  /**
   * Cập nhật feature flag
   * @param id ID của feature flag
   * @param data Dữ liệu cập nhật
   * @returns Feature flag đã cập nhật
   */
  async update(id: number, data: Partial<FeatureFlag>): Promise<FeatureFlag> {
    await this.featureFlagRepository.update(id, data);
    return this.featureFlagRepository.findOne({ where: { id } });
  }

  /**
   * Cập nhật feature flag theo key
   * @param key Key của feature flag
   * @param enabled Trạng thái mới
   * @returns Feature flag đã cập nhật
   */
  async updateByKey(key: string, enabled: boolean): Promise<FeatureFlag> {
    const featureFlag = await this.findByKey(key);
    
    if (!featureFlag) {
      // Tạo mới nếu không tìm thấy
      return this.create({ key, enabled });
    }
    
    featureFlag.enabled = enabled;
    return this.featureFlagRepository.save(featureFlag);
  }

  /**
   * Xóa feature flag
   * @param id ID của feature flag
   */
  async delete(id: number): Promise<void> {
    await this.featureFlagRepository.delete(id);
  }

  /**
   * Kiểm tra xem feature có được bật hay không
   * @param key Key của feature
   * @param defaultValue Giá trị mặc định nếu không tìm thấy
   * @returns true nếu feature được bật, false nếu không
   */
  async isFeatureEnabled(key: string, defaultValue: boolean = true): Promise<boolean> {
    const featureFlag = await this.findByKey(key);
    
    if (!featureFlag) {
      // Tạo mới với giá trị mặc định
      await this.create({
        key,
        enabled: defaultValue,
        description: `Auto-created feature flag for ${key}`
      });
      return defaultValue;
    }
    
    return featureFlag.enabled;
  }

  /**
   * Bật/tắt feature
   * @param key Key của feature
   * @param enabled true để bật, false để tắt
   * @returns Feature flag đã cập nhật
   */
  async setFeatureEnabled(key: string, enabled: boolean): Promise<FeatureFlag> {
    return this.updateByKey(key, enabled);
  }
} 