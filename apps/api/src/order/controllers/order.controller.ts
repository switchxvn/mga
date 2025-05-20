import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { OrderCancelDto, OrderConfirmDto } from '../dtos/order-action.dto';
import { OrderResponseDto } from '../dtos/order-response.dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@ApiTags('Orders')
@Controller('orders')
@ApiSecurity('api-key')
@ApiSecurity('api-secret')
@UseGuards(ApiKeyGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Order created successfully', type: OrderResponseDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid order data' })
  async createOrder(@Body() createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    return this.orderService.createOrder(createOrderDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details by ID' })
  @ApiParam({ name: 'id', description: 'Order ID', type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Order details', type: OrderResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
  async getOrderById(@Param('id', ParseIntPipe) id: number): Promise<OrderResponseDto> {
    return this.orderService.getOrderById(id);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm order payment and generate tickets' })
  @ApiBody({ type: OrderConfirmDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Order confirmed successfully', type: OrderResponseDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid confirmation data' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
  async confirmOrder(@Body() confirmDto: OrderConfirmDto): Promise<OrderResponseDto> {
    return this.orderService.confirmOrder(confirmDto);
  }

  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel pending order' })
  @ApiBody({ type: OrderCancelDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Order cancelled successfully', type: OrderResponseDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Cannot cancel this order' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Order not found' })
  async cancelOrder(@Body() cancelDto: OrderCancelDto): Promise<OrderResponseDto> {
    return this.orderService.cancelOrder(cancelDto);
  }
} 