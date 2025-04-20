import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from '../entities/settings.entity';
import { In } from 'typeorm';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>,
  ) {}

  async findByKey(key: string): Promise<Settings | null> {
    return this.settingsRepository.findOne({
      where: { key }
    });
  }

  async findByKeys(keys: string[]): Promise<Settings[]> {
    return this.settingsRepository.find({
      where: { key: In(keys) }
    });
  }

  async findByGroup(group: string): Promise<Settings[]> {
    return this.settingsRepository.find({
      where: { group }
    });
  }
} 