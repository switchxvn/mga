import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ZnsConfiguration, ZnsTemplate, ZnsLog } from '../../entities';
import { ZnsTemplateType, ZnsMessageStatus } from '@ew/shared';

export interface CreateZnsConfigurationDto {
  name: string;
  app_id: string;
  app_secret: string;
  oa_id?: string;
  webhook_url?: string;
  webhook_secret?: string;
  is_active?: boolean;
}

export interface UpdateZnsConfigurationDto {
  name?: string;
  app_secret?: string;
  oa_id?: string;
  webhook_url?: string;
  webhook_secret?: string;
  is_active?: boolean;
}

export interface CreateZnsTemplateDto {
  template_type: ZnsTemplateType;
  zalo_template_id: string;
  template_name: string;
  description?: string;
  template_data_example?: Record<string, any>;
  is_active?: boolean;
  configuration_id: number;
}

export interface UpdateZnsTemplateDto {
  zalo_template_id?: string;
  template_name?: string;
  description?: string;
  template_data_example?: Record<string, any>;
  is_active?: boolean;
}

@Injectable()
export class ZnsAdminService {
  constructor(
    @InjectRepository(ZnsConfiguration)
    private readonly configRepo: Repository<ZnsConfiguration>,
    @InjectRepository(ZnsTemplate)
    private readonly templateRepo: Repository<ZnsTemplate>,
    @InjectRepository(ZnsLog)
    private readonly logRepo: Repository<ZnsLog>,
  ) {}

  // Configuration Management
  async createConfiguration(dto: CreateZnsConfigurationDto): Promise<ZnsConfiguration> {
    // Check if app_id already exists
    const existingConfig = await this.configRepo.findOne({
      where: { app_id: dto.app_id },
    });

    if (existingConfig) {
      throw new BadRequestException('Configuration with this app_id already exists');
    }

    // If this is set as active, deactivate others
    if (dto.is_active) {
      await this.configRepo.update({ is_active: true }, { is_active: false });
    }

    const config = this.configRepo.create(dto);
    return this.configRepo.save(config);
  }

  async updateConfiguration(id: number, dto: UpdateZnsConfigurationDto): Promise<ZnsConfiguration> {
    const config = await this.configRepo.findOne({ where: { id } });
    if (!config) {
      throw new NotFoundException('Configuration not found');
    }

    // If this is set as active, deactivate others
    if (dto.is_active) {
      await this.configRepo.update(
        { is_active: true, id: { $ne: id } } as any,
        { is_active: false },
      );
    }

    Object.assign(config, dto);
    return this.configRepo.save(config);
  }

  async deleteConfiguration(id: number): Promise<void> {
    const config = await this.configRepo.findOne({ where: { id } });
    if (!config) {
      throw new NotFoundException('Configuration not found');
    }

    await this.configRepo.remove(config);
  }

  async getConfigurations(): Promise<ZnsConfiguration[]> {
    return this.configRepo.find({
      order: { created_at: 'DESC' },
      relations: ['templates'],
    });
  }

  async getConfiguration(id: number): Promise<ZnsConfiguration> {
    const config = await this.configRepo.findOne({
      where: { id },
      relations: ['templates'],
    });

    if (!config) {
      throw new NotFoundException('Configuration not found');
    }

    return config;
  }

  // Template Management
  async createTemplate(dto: CreateZnsTemplateDto): Promise<ZnsTemplate> {
    // Check if template type already exists for this configuration
    const existingTemplate = await this.templateRepo.findOne({
      where: {
        template_type: dto.template_type,
        configuration_id: dto.configuration_id,
      },
    });

    if (existingTemplate) {
      throw new BadRequestException(
        'Template with this type already exists for this configuration',
      );
    }

    // Verify configuration exists
    const config = await this.configRepo.findOne({
      where: { id: dto.configuration_id },
    });

    if (!config) {
      throw new NotFoundException('Configuration not found');
    }

    const template = this.templateRepo.create(dto);
    return this.templateRepo.save(template);
  }

  async updateTemplate(id: number, dto: UpdateZnsTemplateDto): Promise<ZnsTemplate> {
    const template = await this.templateRepo.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    Object.assign(template, dto);
    return this.templateRepo.save(template);
  }

  async deleteTemplate(id: number): Promise<void> {
    const template = await this.templateRepo.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException('Template not found');
    }

    await this.templateRepo.remove(template);
  }

  async getTemplates(configurationId?: number): Promise<ZnsTemplate[]> {
    const where = configurationId ? { configuration_id: configurationId } : {};
    
    return this.templateRepo.find({
      where,
      order: { created_at: 'DESC' },
      relations: ['configuration'],
    });
  }

  async getTemplate(id: number): Promise<ZnsTemplate> {
    const template = await this.templateRepo.findOne({
      where: { id },
      relations: ['configuration'],
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  // Statistics
  async getStatistics(): Promise<{
    total_configurations: number;
    active_configurations: number;
    total_templates: number;
    active_templates: number;
    total_messages_sent: number;
    messages_sent_today: number;
    messages_delivered_today: number;
    success_rate_today: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalConfigurations,
      activeConfigurations,
      totalTemplates,
      activeTemplates,
      totalMessagesSent,
      messagesSentToday,
      messagesDeliveredToday,
    ] = await Promise.all([
      this.configRepo.count(),
      this.configRepo.count({ where: { is_active: true } }),
      this.templateRepo.count(),
      this.templateRepo.count({ where: { is_active: true } }),
      this.logRepo.count(),
      this.logRepo.count({
        where: {
          created_at: { $gte: today, $lt: tomorrow } as any,
        },
      }),
      this.logRepo.count({
        where: {
          created_at: { $gte: today, $lt: tomorrow } as any,
          status: ZnsMessageStatus.DELIVERED,
        },
      }),
    ]);

    const successRateToday = messagesSentToday > 0 
      ? (messagesDeliveredToday / messagesSentToday) * 100 
      : 0;

    return {
      total_configurations: totalConfigurations,
      active_configurations: activeConfigurations,
      total_templates: totalTemplates,
      active_templates: activeTemplates,
      total_messages_sent: totalMessagesSent,
      messages_sent_today: messagesSentToday,
      messages_delivered_today: messagesDeliveredToday,
      success_rate_today: Math.round(successRateToday * 100) / 100,
    };
  }
} 