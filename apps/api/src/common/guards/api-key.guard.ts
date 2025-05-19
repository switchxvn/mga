import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { ApiKeyFrontendService } from '../../../../backend/src/modules/api-key/frontend/services/api-key-frontend.service';
import { ConfigService } from '@nestjs/config';
import { ApiKey } from '../../../../backend/src/modules/api-key/entities/api-key.entity';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);

  constructor(
    private readonly apiKeyService: ApiKeyFrontendService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    return this.validateRequest(request);
  }

  private async validateRequest(request: Request): Promise<boolean> {
    const apiKey = request.headers['x-api-key'] as string;
    const apiSecret = request.headers['x-api-secret'] as string;
    
    if (!apiKey || !apiSecret) {
      this.logger.warn('Missing API key or secret header');
      throw new UnauthorizedException('API key and secret are required');
    }

    try {
      // Validate API key and secret
      const clientIp = request.ip || request.socket.remoteAddress || '';
      
      // Validate API key exists and is active
      const validApiKey = await this.apiKeyService.validateApiKey(apiKey, apiSecret);
      
      // Check if the API key has the necessary permissions
      if (!this.hasRequiredPermissions(validApiKey, request.path, request.method)) {
        this.logger.warn(`API key ${apiKey} attempted to access ${request.method} ${request.path} without permission`);
        throw new UnauthorizedException('Insufficient permissions');
      }
      
      // Validate IP restrictions if configured
      if (!this.validateIpRestriction(validApiKey, clientIp)) {
        this.logger.warn(`API key ${apiKey} attempted access from restricted IP ${clientIp}`);
        throw new UnauthorizedException('IP address not allowed');
      }
      
      // Validate API key expiration
      if (validApiKey.expires_at && new Date(validApiKey.expires_at) < new Date()) {
        this.logger.warn(`API key ${apiKey} has expired`);
        throw new UnauthorizedException('API key has expired');
      }
      
      // Store API key info in request for later use
      request['apiKey'] = validApiKey;
      
      return true;
    } catch (error) {
      this.logger.error('API key validation failed:', error.message);
      throw new UnauthorizedException('Invalid API credentials');
    }
  }

  private hasRequiredPermissions(apiKey: ApiKey, path: string, method: string): boolean {
    // If no permissions are set, deny access by default
    if (!apiKey.permissions) {
      return this.configService.get('API_KEY_DEFAULT_ALLOW') === 'true';
    }

    // Simplified permission check
    const modulePermissions = {
      '/external-api/tickets': apiKey.permissions.tickets,
      '/external-api/orders': apiKey.permissions.orders,
      '/external-api/webhook/ticket-updates': apiKey.permissions.webhooks,
    };

    // Get the base path (first two segments)
    const segments = path.split('/').filter(Boolean);
    const basePath = segments.length > 0 ? `/${segments[0]}/${segments[1]}` : path;
    
    // Check if the API key has permissions for this path
    const hasAccess = modulePermissions[basePath];
    
    // If permissions are explicitly defined for this path, respect them
    if (hasAccess !== undefined) {
      return hasAccess === true || (typeof hasAccess === 'object' && hasAccess[method.toLowerCase()]);
    }
    
    // Fall back to default allow setting
    return this.configService.get('API_KEY_DEFAULT_ALLOW') === 'true';
  }

  private validateIpRestriction(apiKey: ApiKey, clientIp: string): boolean {
    // If no IP restrictions are set, allow all
    if (!apiKey.ip_restrictions) {
      return true;
    }

    // Simple implementation: check if the client IP is in the allowed list
    // For more complex IP range checking, consider using a library like ip-range-check
    const allowedIps = apiKey.ip_restrictions.split(',').map(ip => ip.trim());
    
    return allowedIps.includes(clientIp) || allowedIps.includes('*');
  }
} 