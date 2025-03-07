import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceRequest, PriceRequestStatus } from '../entities/price-request.entity';
import { CreatePriceRequestDto } from '../dto/create-price-request.dto';

@Injectable()
export class PriceRequestService {
  constructor(
    @InjectRepository(PriceRequest)
    private priceRequestRepository: Repository<PriceRequest>,
  ) {}

  async create(createPriceRequestDto: CreatePriceRequestDto): Promise<PriceRequest> {
    const priceRequest = this.priceRequestRepository.create({
      ...createPriceRequestDto,
      status: PriceRequestStatus.PENDING,
    });
    
    return this.priceRequestRepository.save(priceRequest);
  }

  async findAll(): Promise<PriceRequest[]> {
    return this.priceRequestRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<PriceRequest> {
    return this.priceRequestRepository.findOne({
      where: { id },
    });
  }

  async findByProductId(productId: number): Promise<PriceRequest[]> {
    return this.priceRequestRepository.find({
      where: { productId },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async updateStatus(id: number, status: PriceRequestStatus): Promise<PriceRequest> {
    await this.priceRequestRepository.update(id, { status });
    return this.findOne(id);
  }
} 