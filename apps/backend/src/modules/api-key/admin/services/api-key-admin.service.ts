import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { ApiKey } from '../../entities/api-key.entity';

@Injectable()
export class ApiKeyAdminService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: Repository<ApiKey>,
  ) {}

  /**
   * Get all API keys
   */
  async findAll(): Promise<ApiKey[]> {
    return this.apiKeyRepository.find({
      order: {
        created_at: 'DESC',
      },
    });
  }

  /**
   * Find API key by ID
   */
  async findById(id: number): Promise<ApiKey> {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { id },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    return apiKey;
  }

  /**
   * Create a new API key
   */
  async create(data: {
    name: string;
    description?: string;
    permissions?: Record<string, any>;
    expiresAt?: Date;
    ipRestrictions?: string;
  }): Promise<ApiKey> {
    // Generate random key and secret
    const key = this.generateKey();
    const secret = this.generateSecret();

    const apiKey = this.apiKeyRepository.create({
      name: data.name,
      key: key,
      secret: secret,
      description: data.description,
      permissions: data.permissions,
      expires_at: data.expiresAt,
      ip_restrictions: data.ipRestrictions,
    });

    return this.apiKeyRepository.save(apiKey);
  }

  /**
   * Update an API key
   */
  async update(
    id: number,
    data: {
      name?: string;
      description?: string;
      is_active?: boolean;
      permissions?: Record<string, any>;
      expiresAt?: Date;
      ipRestrictions?: string;
    },
  ): Promise<ApiKey> {
    const apiKey = await this.findById(id);

    if (data.name) apiKey.name = data.name;
    if (data.description !== undefined) apiKey.description = data.description;
    if (data.is_active !== undefined) apiKey.is_active = data.is_active;
    if (data.permissions) apiKey.permissions = data.permissions;
    if (data.expiresAt) apiKey.expires_at = data.expiresAt;
    if (data.ipRestrictions) apiKey.ip_restrictions = data.ipRestrictions;

    return this.apiKeyRepository.save(apiKey);
  }

  /**
   * Regenerate API key secret
   */
  async regenerateSecret(id: number): Promise<ApiKey> {
    const apiKey = await this.findById(id);
    apiKey.secret = this.generateSecret();
    return this.apiKeyRepository.save(apiKey);
  }

  /**
   * Delete an API key
   */
  async delete(id: number): Promise<void> {
    const apiKey = await this.findById(id);
    await this.apiKeyRepository.remove(apiKey);
  }

  /**
   * Generate a random API key
   */
  private generateKey(): string {
    return `ak_${crypto.randomBytes(16).toString('hex')}`;
  }

  /**
   * Generate a random secret
   */
  private generateSecret(): string {
    return `sk_${crypto.randomBytes(32).toString('hex')}`;
  }
} 