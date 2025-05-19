import { Controller, Get, Logger, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { TicketService } from '../services/ticket.service';
import { TicketAvailabilityQueryDto, TicketAvailabilityResponseDto } from '../dtos/ticket-availability.dto';
import { TicketListResponseDto, TicketResponseDto } from '../dtos/ticket-response.dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { ApiKeyData } from '../../common/decorators/api-key.decorator';
import { ApiKey } from '../../../../backend/src/modules/api-key/entities/api-key.entity';

@ApiTags('Tickets')
@Controller('tickets')
@ApiSecurity('api-key')
@ApiSecurity('api-secret')
@UseGuards(ApiKeyGuard)
export class TicketController {
  private readonly logger = new Logger(TicketController.name);

  constructor(private readonly ticketService: TicketService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available tickets' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', type: Number })
  @ApiResponse({ status: 200, description: 'List of tickets', type: TicketListResponseDto })
  async getAllTickets(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @ApiKeyData() apiKey?: ApiKey,
  ): Promise<TicketListResponseDto> {
    // Ghi log API key sử dụng để theo dõi request
    if (apiKey) {
      this.logger.log(`API request from: ${apiKey.name} (${apiKey.key})`);
    }
    
    return this.ticketService.getTickets(page || 1, limit || 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ticket details by ID' })
  @ApiParam({ name: 'id', description: 'Ticket ID', type: Number })
  @ApiResponse({ status: 200, description: 'Ticket details', type: TicketResponseDto })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async getTicketById(
    @Param('id', ParseIntPipe) id: number,
    @ApiKeyData('name') apiKeyName?: string,
  ): Promise<TicketResponseDto> {
    // Ghi log tên API key sử dụng để theo dõi request
    if (apiKeyName) {
      this.logger.log(`API request for ticket ${id} from: ${apiKeyName}`);
    }
    
    return this.ticketService.getTicketById(id);
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Check ticket availability by date' })
  @ApiParam({ name: 'id', description: 'Ticket ID', type: Number })
  @ApiResponse({ status: 200, description: 'Ticket availability', type: TicketAvailabilityResponseDto })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  async checkAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: TicketAvailabilityQueryDto,
  ): Promise<TicketAvailabilityResponseDto> {
    return this.ticketService.getTicketAvailability(id, query.date, query.variantId);
  }
} 