import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios, { AxiosError } from 'axios';
import { ZnsConfiguration, ZnsTemplate, ZnsLog } from '../entities';
import { ZnsTemplateType, ZnsMessageStatus } from '@ew/shared';
import {
  SendZnsMessageDto,
  ZnsApiResponse,
  ZnsSendRequest,
  ZnsTokenResponse,
  ZnsQuotaInfo,
} from '@ew/shared';

@Injectable()
export class ZnsService {
  private readonly logger = new Logger(ZnsService.name);
  private readonly ZNS_API_BASE_URL = 'https://business.openapi.zalo.me';

  constructor(
    @InjectRepository(ZnsConfiguration)
    private readonly configRepo: Repository<ZnsConfiguration>,
    @InjectRepository(ZnsTemplate)
    private readonly templateRepo: Repository<ZnsTemplate>,
    @InjectRepository(ZnsLog)
    private readonly logRepo: Repository<ZnsLog>,
  ) {}

  async sendMessage(dto: SendZnsMessageDto): Promise<ZnsLog> {
    try {
      const config = await this.getActiveConfiguration();
      if (!config) {
        throw new BadRequestException('No active ZNS configuration found');
      }

      const template = await this.getTemplateByType(dto.template_type, config.id);
      if (!template) {
        throw new BadRequestException(`Template not found for type: ${dto.template_type}`);
      }

      await this.ensureValidAccessToken(config);

      const trackingId = dto.tracking_id || this.generateTrackingId();

      const log = this.logRepo.create({
        tracking_id: trackingId,
        template_type: dto.template_type,
        zalo_template_id: template.zalo_template_id,
        recipient_phone: dto.recipient_phone,
        template_data: dto.template_data,
        status: ZnsMessageStatus.PENDING,
        configuration_id: config.id,
        related_entity_type: dto.related_entity_type,
        related_entity_id: dto.related_entity_id,
      });

      await this.logRepo.save(log);

      try {
        const payload: ZnsSendRequest = {
          phone: dto.recipient_phone,
          template_id: template.zalo_template_id,
          template_data: dto.template_data,
          tracking_id: trackingId,
        };

        const response = await this.callZaloAPI(config, payload);

        if (response.error === 0 && response.data) {
          log.msg_id = response.data.msg_id;
          log.sent_time = parseInt(response.data.sent_time);
          log.status = ZnsMessageStatus.SENT;

          if (response.data.quota) {
            await this.updateQuotaInfo(config, response.data.quota);
          }
        } else {
          log.status = ZnsMessageStatus.FAILED;
          log.error_code = response.error?.toString();
          log.error_message = response.message;
        }

        await this.logRepo.save(log);
        return log;
      } catch (error) {
        log.status = ZnsMessageStatus.FAILED;
        
        if (error instanceof AxiosError) {
          log.error_code = error.response?.status?.toString() || 'NETWORK_ERROR';
          log.error_message = error.message;
        } else {
          log.error_code = 'UNKNOWN_ERROR';
          log.error_message = error.message;
        }

        await this.logRepo.save(log);
        throw error;
      }
    } catch (error) {
      this.logger.error(`ZNS service error: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async callZaloAPI(config: ZnsConfiguration, payload: ZnsSendRequest): Promise<ZnsApiResponse> {
    const url = `${this.ZNS_API_BASE_URL}/message/template`;

    const response = await axios.post<ZnsApiResponse>(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'access_token': config.access_token,
      },
      timeout: 30000,
    });

    return response.data;
  }

  private async ensureValidAccessToken(config: ZnsConfiguration): Promise<void> {
    if (!config.access_token || this.isTokenExpired(config)) {
      await this.refreshAccessToken(config);
    }
  }

  private isTokenExpired(config: ZnsConfiguration): boolean {
    if (!config.token_expires_at) {
      return true;
    }

    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
    const expiryWithBuffer = new Date(config.token_expires_at.getTime() - bufferTime);
    
    return new Date() >= expiryWithBuffer;
  }

  private async refreshAccessToken(config: ZnsConfiguration): Promise<void> {
    try {
      if (!config.refresh_token) {
        throw new Error('No refresh token available');
      }

      const url = `${this.ZNS_API_BASE_URL}/auth/token`;
      
      const response = await axios.post<ZnsTokenResponse>(url, {
        grant_type: 'refresh_token',
        refresh_token: config.refresh_token,
        app_id: config.app_id,
        app_secret: config.app_secret,
      });

      config.access_token = response.data.access_token;
      config.refresh_token = response.data.refresh_token;
      config.token_expires_at = new Date(Date.now() + response.data.expires_in * 1000);

      await this.configRepo.save(config);
    } catch (error) {
      this.logger.error(`Failed to refresh access token: ${error.message}`);
      throw new BadRequestException('Failed to refresh access token');
    }
  }

  private async updateQuotaInfo(config: ZnsConfiguration, quota: { dailyQuota: string; remainingQuota: string }): Promise<void> {
    config.daily_quota = parseInt(quota.dailyQuota);
    config.remaining_quota = parseInt(quota.remainingQuota);
    config.quota_reset_at = new Date();
    await this.configRepo.save(config);
  }

  private async getActiveConfiguration(): Promise<ZnsConfiguration | null> {
    return this.configRepo.findOne({ where: { is_active: true } });
  }

  private async getTemplateByType(templateType: ZnsTemplateType, configId: number): Promise<ZnsTemplate | null> {
    return this.templateRepo.findOne({
      where: {
        template_type: templateType,
        configuration_id: configId,
        is_active: true,
      },
    });
  }

  private generateTrackingId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `zns_${timestamp}_${random}`;
  }

  async getQuotaInfo(): Promise<ZnsQuotaInfo | null> {
    const config = await this.getActiveConfiguration();
    if (!config) return null;

    return {
      daily_quota: config.daily_quota,
      remaining_quota: config.remaining_quota,
      quota_reset_at: config.quota_reset_at,
    };
  }
} 