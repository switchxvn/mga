import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { ApiKeyFrontendService } from '../../../../backend/src/modules/api-key/frontend/services/api-key-frontend.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeyService: ApiKeyFrontendService) {}

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
      throw new UnauthorizedException('API key and secret are required');
    }

    try {
      const clientIp = request.ip || request.socket.remoteAddress || '';
      const validApiKey = await this.apiKeyService.validateApiKey(apiKey, apiSecret);
      
      // Validate IP restrictions
      if (!this.apiKeyService.validateIpRestriction(validApiKey, clientIp)) {
        throw new UnauthorizedException('IP address not allowed');
      }
      
      // Store API key info in request for later use
      request['apiKey'] = validApiKey;
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid API credentials');
    }
  }
} 