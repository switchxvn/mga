import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from '../../entities/api-key.entity';

@Injectable()
export class ApiKeyFrontendService {
  private readonly logger = new Logger(ApiKeyFrontendService.name);

  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
  ) {}

  /**
   * Validate API key and secret
   */
  async validateApiKey(key: string, secret: string): Promise<ApiKey> {
    this.logger.debug(`Validating API key: ${key}`);

    // Find API key in the database
    const apiKey = await this.apiKeyRepository.findOne({
      where: {
        key,
        is_active: true,
      },
    });

    // Check if API key exists and is valid
    if (!apiKey) {
      this.logger.warn(`Invalid API key: ${key}`);
      throw new UnauthorizedException('Invalid API key');
    }

    // Check if API key is expired
    if (apiKey.expires_at && new Date() > apiKey.expires_at) {
      this.logger.warn(`Expired API key: ${key}`);
      throw new UnauthorizedException('API key has expired');
    }

    // Validate the secret
    if (apiKey.secret !== secret) {
      this.logger.warn(`Invalid secret for API key: ${key}`);
      throw new UnauthorizedException('Invalid API secret');
    }

    return apiKey;
  }

  /**
   * Validate if API key has specific permission
   */
  async validatePermission(key: string, secret: string, permission: string): Promise<boolean> {
    const apiKey = await this.validateApiKey(key, secret);
    
    // If no permissions are defined, deny access
    if (!apiKey.permissions) {
      return false;
    }

    // Check if API key has the required permission
    return !!apiKey.permissions[permission];
  }

  /**
   * Validate API key against IP restrictions
   */
  validateIpRestriction(apiKey: ApiKey, clientIp: string): boolean {
    // If no IP restrictions are defined, allow access
    if (!apiKey.ip_restrictions) {
      return true;
    }

    // Split IP restrictions by comma and check if client IP is in the list
    const allowedIps = apiKey.ip_restrictions.split(',').map(ip => ip.trim());
    return allowedIps.includes(clientIp);
  }
} 