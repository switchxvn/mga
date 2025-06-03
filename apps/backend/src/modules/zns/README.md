# Zalo Notification Service (ZNS) Module

This module provides integration with Zalo's Notification Service (ZNS) for sending template-based messages to users via Zalo.

## Features

- ✅ Send template-based notifications via Zalo ZNS API
- ✅ Automatic access token management and refresh
- ✅ Webhook handling for delivery status updates
- ✅ Message logging and tracking
- ✅ Template management with local enum mapping
- ✅ Admin interface for configuration management
- ✅ Quota tracking and management
- ✅ Convenient notification service for common use cases

## Database Tables

The module creates 4 main tables:

1. **zns_configurations** - Store Zalo app credentials and settings
2. **zns_templates** - Map local template types to Zalo template IDs
3. **zns_logs** - Track sent messages and their status
4. **zns_webhook_events** - Store webhook events from Zalo

## Setup

### 1. Run Migration

```bash
npm run migration:run
```

### 2. Configure Zalo App

1. Create a Zalo app at [Zalo Developer Console](https://developers.zalo.me/)
2. Get your App ID and App Secret
3. Set up ZNS templates in [Zalo Cloud Admin](https://zalo.cloud/zns)
4. Configure webhook URL for delivery status updates

### 3. Add Configuration

Use the admin service to add your Zalo configuration:

```typescript
import { ZnsAdminService } from './modules/zns/admin/services/zns-admin.service';

// Create configuration
await znsAdminService.createConfiguration({
  name: 'Production ZNS',
  app_id: 'your_zalo_app_id',
  app_secret: 'your_zalo_app_secret',
  oa_id: 'your_official_account_id',
  webhook_url: 'https://yourdomain.com/zns/webhook',
  webhook_secret: 'your_webhook_secret',
  is_active: true,
});
```

### 4. Add Templates

Map your Zalo template IDs to local template types:

```typescript
// Add template mapping
await znsAdminService.createTemplate({
  template_type: ZnsTemplateType.ORDER_CONFIRMATION,
  zalo_template_id: 'your_zalo_template_id_from_zca',
  template_name: 'Order Confirmation',
  description: 'Sent when order is confirmed',
  template_data_example: {
    customer_name: 'Nguyễn Văn A',
    order_code: 'ORD001',
    total_amount: '1,000,000',
    order_date: '01/01/2024',
  },
  configuration_id: 1,
});
```

## Usage

### Basic Usage

```typescript
import { ZnsService } from './modules/zns/services/zns.service';
import { ZnsTemplateType } from '@shared/lib/enums';

constructor(private readonly znsService: ZnsService) {}

// Send a message
await this.znsService.sendMessage({
  template_type: ZnsTemplateType.ORDER_CONFIRMATION,
  recipient_phone: '0901234567',
  template_data: {
    customer_name: 'Nguyễn Văn A',
    order_code: 'ORD001',
    total_amount: '1,000,000',
    order_date: '01/01/2024',
  },
  related_entity_type: 'order',
  related_entity_id: '123',
});
```

### Using Notification Service (Recommended)

```typescript
import { ZnsNotificationService } from './modules/zns/services/zns-notification.service';

constructor(private readonly znsNotificationService: ZnsNotificationService) {}

// Send order confirmation
await this.znsNotificationService.sendOrderConfirmation({
  phone: '0901234567',
  customerName: 'Nguyễn Văn A',
  orderCode: 'ORD001',
  totalAmount: 1000000,
  orderDate: '01/01/2024',
  orderId: '123',
});

// Send ticket booking confirmation
await this.znsNotificationService.sendTicketBookingSuccess({
  phone: '0901234567',
  customerName: 'Nguyễn Văn A',
  ticketCode: 'TKT001',
  eventName: 'Concert ABC',
  eventDate: '15/01/2024',
  eventTime: '19:00',
  venue: 'Nhà hát Lớn Hà Nội',
  ticketId: '456',
});
```

## Template Types

The following template types are supported:

- `ORDER_CONFIRMATION` - Order confirmation messages
- `ORDER_STATUS_UPDATE` - Order status change notifications
- `PAYMENT_CONFIRMATION` - Payment confirmation messages
- `TICKET_BOOKING_SUCCESS` - Ticket booking confirmations
- `TICKET_REMINDER` - Event reminders
- `PRICE_REQUEST_RECEIVED` - Price request acknowledgments
- `PRICE_REQUEST_RESPONSE` - Price quotes
- `SYSTEM_NOTIFICATION` - General system notifications
- `PROMOTIONAL_MESSAGE` - Marketing messages
- `USER_VERIFICATION` - Account verification codes
- `PASSWORD_RESET` - Password reset codes

## Webhook Configuration

Set up webhook endpoint to receive delivery status updates:

```
POST /zns/webhook
```

The webhook will automatically update message status to `DELIVERED` when users receive messages.

## Admin Management

Use the admin service for configuration management:

```typescript
import { ZnsAdminService } from './modules/zns/admin/services/zns-admin.service';

// Get statistics
const stats = await znsAdminService.getStatistics();

// Get all configurations
const configs = await znsAdminService.getConfigurations();

// Get all templates
const templates = await znsAdminService.getTemplates();
```

## Message Status Tracking

Messages go through these statuses:

1. `PENDING` - Message created, waiting to send
2. `SENT` - Message sent to Zalo API successfully
3. `DELIVERED` - User received the message (via webhook)
4. `FAILED` - Message failed to send

## Error Handling

The service includes comprehensive error handling:

- Automatic token refresh when expired
- Retry logic for failed requests
- Detailed error logging
- Graceful degradation

## Best Practices

1. **Template Design**: Design templates in Zalo Cloud Admin first
2. **Phone Format**: Use Vietnamese phone format (0901234567)
3. **Data Validation**: Validate template data before sending
4. **Rate Limiting**: Monitor daily quota usage
5. **Error Monitoring**: Set up alerts for failed messages
6. **Webhook Security**: Validate webhook signatures if needed

## Environment Variables

```env
# Database configuration (already configured)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=ecommerce
```

## API Endpoints

### Webhook Endpoint
- `POST /zns/webhook` - Receive delivery status updates from Zalo

## Monitoring

Monitor the following metrics:

- Daily message quota usage
- Message delivery rates
- Failed message counts
- Template performance
- Webhook processing status

## Troubleshooting

### Common Issues

1. **Token Expired**: Tokens are automatically refreshed
2. **Template Not Found**: Check template mapping in database
3. **Invalid Phone Number**: Ensure Vietnamese phone format
4. **Quota Exceeded**: Check daily limits in Zalo Cloud
5. **Webhook Not Working**: Verify webhook URL and SSL certificate

### Logs

Check application logs for detailed error information:

```bash
# Filter ZNS logs
grep "ZnsService\|ZnsWebhookService\|ZnsNotificationService" logs/app.log
```

## Support

For issues related to:
- Zalo API: Contact Zalo Developer Support
- Template approval: Use Zalo Cloud Admin
- Integration issues: Check application logs and database 