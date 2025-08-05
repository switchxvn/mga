import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Seo } from '../../entities/seo.entity';
import { CreateSeoInput, UpdateSeoInput } from '@ew/shared';

@Injectable()
export class SeoAdminService {
  constructor(
    @InjectRepository(Seo)
    private readonly seoRepository: Repository<Seo>,
  ) {}

  async findAll(filters: Partial<{ pagePath: string; isActive: boolean }> = {}): Promise<Seo[]> {
    return this.seoRepository.find({
      where: filters,
    });
  }

  async findById(id: number): Promise<Seo> {
    const seo = await this.seoRepository.findOne({
      where: { id },
    });

    if (!seo) {
      throw new NotFoundException(`SEO with ID ${id} not found`);
    }

    return seo;
  }

  async create(data: CreateSeoInput): Promise<Seo> {
    const seo = this.seoRepository.create(data);
    return this.seoRepository.save(seo);
  }

  async update(id: number, data: UpdateSeoInput): Promise<Seo> {
    const seo = await this.findById(id);
    Object.assign(seo, data);
    return this.seoRepository.save(seo);
  }

  async delete(id: number): Promise<{ success: boolean; message: string }> {
    const seo = await this.findById(id);
    await this.seoRepository.remove(seo);
    return {
      success: true,
      message: `SEO with ID ${id} has been deleted`,
    };
  }

  // New methods for admin router
  async findByPath(pagePath: string): Promise<Seo | null> {
    return this.seoRepository.findOne({
      where: { pagePath },
    });
  }

  async findAllPaginated(filters: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{ data: Seo[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const queryBuilder = this.seoRepository.createQueryBuilder('seo');

    // Apply filters
    if (search) {
      queryBuilder.where(
        '(seo.pagePath LIKE :search OR seo.title LIKE :search OR seo.description LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('seo.isActive = :isActive', { isActive });
    }

    // Apply sorting
    queryBuilder.orderBy(`seo.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async bulkUpdate(
    ids: number[],
    data: Partial<Pick<Seo, 'isActive'>>
  ): Promise<{ affected: number }> {
    const result = await this.seoRepository
      .createQueryBuilder()
      .update(Seo)
      .set(data)
      .where('id IN (:...ids)', { ids })
      .execute();

    return { affected: result.affected || 0 };
  }

  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    withoutTitle: number;
    withoutDescription: number;
  }> {
    const [
      total,
      active,
      inactive,
      withoutTitle,
      withoutDescription
    ] = await Promise.all([
      this.seoRepository.count(),
      this.seoRepository.count({ where: { isActive: true } }),
      this.seoRepository.count({ where: { isActive: false } }),
      this.seoRepository.count({ where: { title: '' } }),
      this.seoRepository.count({ where: { description: '' } }),
    ]);

    return {
      total,
      active,
      inactive,
      withoutTitle,
      withoutDescription,
    };
  }
} 