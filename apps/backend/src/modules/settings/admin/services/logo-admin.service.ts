import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logo } from '../../entities/logo.entity';

@Injectable()
export class LogoAdminService {
  constructor(
    @InjectRepository(Logo)
    private readonly logoRepository: Repository<Logo>,
  ) {}

  async findAll(): Promise<Logo[]> {
    return this.logoRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Logo | null> {
    return this.logoRepository.findOne({
      where: { id },
    });
  }

  async create(data: Partial<Logo>): Promise<Logo> {
    const logo = this.logoRepository.create(data);
    return this.logoRepository.save(logo);
  }

  async update(id: number, data: Partial<Logo>): Promise<Logo> {
    await this.logoRepository.update(id, data);
    const updatedLogo = await this.findOne(id);
    if (!updatedLogo) {
      throw new Error(`Logo with ID ${id} not found`);
    }
    return updatedLogo;
  }

  async remove(id: number): Promise<void> {
    await this.logoRepository.delete(id);
  }

  async setActive(id: number, type: string): Promise<void> {
    // Deactivate all logos of the same type
    await this.logoRepository.update(
      { type },
      { isActive: false }
    );

    // Activate the selected logo
    await this.logoRepository.update(
      { id },
      { isActive: true }
    );
  }
} 