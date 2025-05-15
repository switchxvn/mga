import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { PriceRequest, PriceRequestStatus } from '../../entities/price-request.entity';

@Injectable()
export class PriceRequestAdminService {
  private readonly logger = new Logger(PriceRequestAdminService.name);

  constructor(
    @InjectRepository(PriceRequest)
    private readonly priceRequestRepository: Repository<PriceRequest>,
  ) {}

  async findAll(options: {
    page?: number;
    pageSize?: number;
    status?: PriceRequestStatus;
    search?: string;
  }): Promise<{ items: PriceRequest[]; total: number }> {
    const { page = 1, pageSize = 10, status, search } = options;

    const queryBuilder = this.priceRequestRepository
      .createQueryBuilder('priceRequest')
      .leftJoinAndSelect('priceRequest.product', 'product');

    if (status) {
      queryBuilder.andWhere('priceRequest.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(priceRequest.fullName LIKE :search OR priceRequest.email LIKE :search OR priceRequest.phone LIKE :search OR priceRequest.productName LIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [items, total] = await queryBuilder
      .orderBy('priceRequest.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { items, total };
  }

  async findOne(id: number): Promise<PriceRequest> {
    return this.priceRequestRepository.findOne({
      where: { id },
      relations: ['product']
    });
  }

  async updateStatus(id: number, status: PriceRequestStatus): Promise<PriceRequest> {
    await this.priceRequestRepository.update(id, { status });
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.priceRequestRepository.delete(id);
  }

  async findByProductId(productId: number, options?: {
    page?: number;
    pageSize?: number;
  }): Promise<{ items: PriceRequest[]; total: number }> {
    const { page = 1, pageSize = 10 } = options || {};

    const [items, total] = await this.priceRequestRepository.findAndCount({
      where: { productId },
      relations: ['product'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    return { items, total };
  }
} 