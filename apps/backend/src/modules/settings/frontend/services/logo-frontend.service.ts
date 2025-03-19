import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logo } from '../../entities/logo.entity';

@Injectable()
export class LogoFrontendService {
  constructor(
    @InjectRepository(Logo)
    private readonly logoRepository: Repository<Logo>,
  ) {}

  async findOneByType(type: string): Promise<Logo | null> {
    return this.logoRepository.findOne({
      where: {
        type,
        isActive: true,
      },
    });
  }
} 