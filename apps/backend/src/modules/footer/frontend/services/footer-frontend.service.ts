import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Footer } from '../../entities/footer.entity';

@Injectable()
export class FooterFrontendService {
  constructor(
    @InjectRepository(Footer)
    private readonly footerRepository: Repository<Footer>,
  ) {}

  async getActiveFooter() {
    return this.footerRepository.findOne({
      where: { isActive: true },
    });
  }
} 