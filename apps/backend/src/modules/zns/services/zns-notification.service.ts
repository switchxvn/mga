import { Injectable, Logger } from '@nestjs/common';
import { ZnsService } from './zns.service';
import { ZnsTemplateType } from '@ew/shared';
import { SendZnsMessageDto } from '@ew/shared';

@Injectable()
export class ZnsNotificationService {
  private readonly logger = new Logger(ZnsNotificationService.name);

  constructor(private readonly znsService: ZnsService) {}

  /**
   * Send order confirmation notification
   */
  async sendOrderConfirmation(data: {
    phone: string;
    customerName: string;
    orderCode: string;
    totalAmount: number;
    orderDate: string;
    orderId: string;
  }): Promise<void> {
    try {
      const templateData = {
        customer_name: data.customerName,
        order_code: data.orderCode,
        total_amount: data.totalAmount.toLocaleString('vi-VN'),
        order_date: data.orderDate,
      };

      await this.znsService.sendMessage({
        template_type: ZnsTemplateType.ORDER_CONFIRMATION,
        recipient_phone: data.phone,
        template_data: templateData,
        related_entity_type: 'order',
        related_entity_id: data.orderId,
      });

      this.logger.log(`Order confirmation sent to ${data.phone} for order ${data.orderCode}`);
    } catch (error) {
      this.logger.error(`Failed to send order confirmation: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send order status update notification
   */
  async sendOrderStatusUpdate(data: {
    phone: string;
    customerName: string;
    orderCode: string;
    status: string;
    statusMessage: string;
    orderId: string;
  }): Promise<void> {
    try {
      const templateData = {
        customer_name: data.customerName,
        order_code: data.orderCode,
        status: data.status,
        status_message: data.statusMessage,
      };

      await this.znsService.sendMessage({
        template_type: ZnsTemplateType.ORDER_STATUS_UPDATE,
        recipient_phone: data.phone,
        template_data: templateData,
        related_entity_type: 'order',
        related_entity_id: data.orderId,
      });

      this.logger.log(`Order status update sent to ${data.phone} for order ${data.orderCode}`);
    } catch (error) {
      this.logger.error(`Failed to send order status update: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send payment confirmation notification
   */
  async sendPaymentConfirmation(data: {
    phone: string;
    customerName: string;
    orderCode: string;
    paymentAmount: number;
    paymentMethod: string;
    transactionId: string;
    orderId: string;
  }): Promise<void> {
    try {
      const templateData = {
        customer_name: data.customerName,
        order_code: data.orderCode,
        payment_amount: data.paymentAmount.toLocaleString('vi-VN'),
        payment_method: data.paymentMethod,
        transaction_id: data.transactionId,
      };

      await this.znsService.sendMessage({
        template_type: ZnsTemplateType.PAYMENT_CONFIRMATION,
        recipient_phone: data.phone,
        template_data: templateData,
        related_entity_type: 'order',
        related_entity_id: data.orderId,
      });

      this.logger.log(`Payment confirmation sent to ${data.phone} for order ${data.orderCode}`);
    } catch (error) {
      this.logger.error(`Failed to send payment confirmation: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send ticket booking success notification
   */
  async sendTicketBookingSuccess(data: {
    phone: string;
    customerName: string;
    ticketCode: string;
    eventName: string;
    eventDate: string;
    eventTime: string;
    venue: string;
    ticketId: string;
  }): Promise<void> {
    try {
      const templateData = {
        customer_name: data.customerName,
        ticket_code: data.ticketCode,
        event_name: data.eventName,
        event_date: data.eventDate,
        event_time: data.eventTime,
        venue: data.venue,
      };

      await this.znsService.sendMessage({
        template_type: ZnsTemplateType.TICKET_BOOKING_SUCCESS,
        recipient_phone: data.phone,
        template_data: templateData,
        related_entity_type: 'ticket',
        related_entity_id: data.ticketId,
      });

      this.logger.log(`Ticket booking confirmation sent to ${data.phone} for ticket ${data.ticketCode}`);
    } catch (error) {
      this.logger.error(`Failed to send ticket booking confirmation: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send ticket reminder notification
   */
  async sendTicketReminder(data: {
    phone: string;
    customerName: string;
    ticketCode: string;
    eventName: string;
    eventDate: string;
    eventTime: string;
    venue: string;
    hoursUntilEvent: number;
    ticketId: string;
  }): Promise<void> {
    try {
      const templateData = {
        customer_name: data.customerName,
        ticket_code: data.ticketCode,
        event_name: data.eventName,
        event_date: data.eventDate,
        event_time: data.eventTime,
        venue: data.venue,
        hours_until_event: data.hoursUntilEvent.toString(),
      };

      await this.znsService.sendMessage({
        template_type: ZnsTemplateType.TICKET_REMINDER,
        recipient_phone: data.phone,
        template_data: templateData,
        related_entity_type: 'ticket',
        related_entity_id: data.ticketId,
      });

      this.logger.log(`Ticket reminder sent to ${data.phone} for ticket ${data.ticketCode}`);
    } catch (error) {
      this.logger.error(`Failed to send ticket reminder: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send price request received notification
   */
  async sendPriceRequestReceived(data: {
    phone: string;
    customerName: string;
    requestId: string;
    productName: string;
    quantity: number;
    priceRequestId: string;
  }): Promise<void> {
    try {
      const templateData = {
        customer_name: data.customerName,
        request_id: data.requestId,
        product_name: data.productName,
        quantity: data.quantity.toString(),
      };

      await this.znsService.sendMessage({
        template_type: ZnsTemplateType.PRICE_REQUEST_RECEIVED,
        recipient_phone: data.phone,
        template_data: templateData,
        related_entity_type: 'price_request',
        related_entity_id: data.priceRequestId,
      });

      this.logger.log(`Price request received notification sent to ${data.phone}`);
    } catch (error) {
      this.logger.error(`Failed to send price request received notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send price request response notification
   */
  async sendPriceRequestResponse(data: {
    phone: string;
    customerName: string;
    requestId: string;
    productName: string;
    quotedPrice: number;
    validUntil: string;
    priceRequestId: string;
  }): Promise<void> {
    try {
      const templateData = {
        customer_name: data.customerName,
        request_id: data.requestId,
        product_name: data.productName,
        quoted_price: data.quotedPrice.toLocaleString('vi-VN'),
        valid_until: data.validUntil,
      };

      await this.znsService.sendMessage({
        template_type: ZnsTemplateType.PRICE_REQUEST_RESPONSE,
        recipient_phone: data.phone,
        template_data: templateData,
        related_entity_type: 'price_request',
        related_entity_id: data.priceRequestId,
      });

      this.logger.log(`Price request response sent to ${data.phone}`);
    } catch (error) {
      this.logger.error(`Failed to send price request response: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send user verification notification
   */
  async sendUserVerification(data: {
    phone: string;
    customerName: string;
    verificationCode: string;
    expiryMinutes: number;
    userId: string;
  }): Promise<void> {
    try {
      const templateData = {
        customer_name: data.customerName,
        verification_code: data.verificationCode,
        expiry_minutes: data.expiryMinutes.toString(),
      };

      await this.znsService.sendMessage({
        template_type: ZnsTemplateType.USER_VERIFICATION,
        recipient_phone: data.phone,
        template_data: templateData,
        related_entity_type: 'user',
        related_entity_id: data.userId,
      });

      this.logger.log(`User verification sent to ${data.phone}`);
    } catch (error) {
      this.logger.error(`Failed to send user verification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send password reset notification
   */
  async sendPasswordReset(data: {
    phone: string;
    customerName: string;
    resetCode: string;
    expiryMinutes: number;
    userId: string;
  }): Promise<void> {
    try {
      const templateData = {
        customer_name: data.customerName,
        reset_code: data.resetCode,
        expiry_minutes: data.expiryMinutes.toString(),
      };

      await this.znsService.sendMessage({
        template_type: ZnsTemplateType.PASSWORD_RESET,
        recipient_phone: data.phone,
        template_data: templateData,
        related_entity_type: 'user',
        related_entity_id: data.userId,
      });

      this.logger.log(`Password reset notification sent to ${data.phone}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send system notification
   */
  async sendSystemNotification(data: {
    phone: string;
    customerName: string;
    title: string;
    message: string;
    actionUrl?: string;
    userId?: string;
  }): Promise<void> {
    try {
      const templateData = {
        customer_name: data.customerName,
        title: data.title,
        message: data.message,
        action_url: data.actionUrl || '',
      };

      await this.znsService.sendMessage({
        template_type: ZnsTemplateType.SYSTEM_NOTIFICATION,
        recipient_phone: data.phone,
        template_data: templateData,
        related_entity_type: 'system',
        related_entity_id: data.userId,
      });

      this.logger.log(`System notification sent to ${data.phone}`);
    } catch (error) {
      this.logger.error(`Failed to send system notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send promotional message
   */
  async sendPromotionalMessage(data: {
    phone: string;
    customerName: string;
    promotionTitle: string;
    promotionDescription: string;
    discountAmount?: number;
    validUntil: string;
    promoCode?: string;
    actionUrl?: string;
    userId?: string;
  }): Promise<void> {
    try {
      const templateData = {
        customer_name: data.customerName,
        promotion_title: data.promotionTitle,
        promotion_description: data.promotionDescription,
        discount_amount: data.discountAmount?.toLocaleString('vi-VN') || '',
        valid_until: data.validUntil,
        promo_code: data.promoCode || '',
        action_url: data.actionUrl || '',
      };

      await this.znsService.sendMessage({
        template_type: ZnsTemplateType.PROMOTIONAL_MESSAGE,
        recipient_phone: data.phone,
        template_data: templateData,
        related_entity_type: 'promotion',
        related_entity_id: data.userId,
      });

      this.logger.log(`Promotional message sent to ${data.phone}`);
    } catch (error) {
      this.logger.error(`Failed to send promotional message: ${error.message}`);
      throw error;
    }
  }
} 