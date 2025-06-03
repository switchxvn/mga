import { ZnsTemplateType, ZnsMessageStatus } from '../enums';

// ZNS API Request/Response Types
export interface ZnsApiResponse {
  error: number;
  message: string;
  data?: {
    msg_id: string;
    sent_time: string;
    quota: {
      dailyQuota: string;
      remainingQuota: string;
    };
  };
}

export interface ZnsSendRequest {
  phone: string;
  template_id: string;
  template_data: Record<string, any>;
  tracking_id?: string;
}

export interface ZnsTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

// Webhook Event Interfaces
export interface ZnsWebhookEvent {
  sender: string;
  recipient: string;
  event_name: string;
  delivery_time: number;
  msg_id: string;
  tracking_id: string;
  app_id: string;
  timestamp: number;
}

// Configuration Interfaces
export interface ZnsConfiguration {
  id: number;
  name: string;
  app_id: string;
  app_secret: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: Date;
  oa_id?: string;
  webhook_url?: string;
  webhook_secret?: string;
  is_active: boolean;
  daily_quota: number;
  remaining_quota: number;
  quota_reset_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ZnsTemplate {
  id: number;
  template_type: ZnsTemplateType;
  zalo_template_id: string;
  template_name: string;
  description?: string;
  template_data_example?: Record<string, any>;
  is_active: boolean;
  configuration_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface ZnsLog {
  id: number;
  msg_id?: string;
  tracking_id?: string;
  template_type: ZnsTemplateType;
  zalo_template_id: string;
  recipient_phone: string;
  template_data: Record<string, any>;
  status: ZnsMessageStatus;
  sent_time?: number;
  delivery_time?: number;
  error_code?: string;
  error_message?: string;
  configuration_id: number;
  related_entity_type?: string;
  related_entity_id?: string;
  created_at: Date;
  updated_at: Date;
}

// Service DTOs
export interface SendZnsMessageDto {
  template_type: ZnsTemplateType;
  recipient_phone: string;
  template_data: Record<string, any>;
  tracking_id?: string;
  related_entity_type?: string;
  related_entity_id?: string;
}

export interface ZnsQuotaInfo {
  daily_quota: number;
  remaining_quota: number;
  quota_reset_at?: Date;
} 