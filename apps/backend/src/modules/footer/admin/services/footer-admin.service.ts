import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Footer } from '../../entities/footer.entity';
import { CreateFooterInput, UpdateFooterInput } from '@ew/shared';

@Injectable()
export class FooterAdminService {
  constructor(
    @InjectRepository(Footer)
    private readonly footerRepository: Repository<Footer>,
  ) {}

  async create(data: CreateFooterInput) {
    // Convert data to entity format
    const footerData = {
      name: data.name,
      type: data.type,
      content: data.content as any,
      isActive: data.isActive ?? false
    };
    
    const footer = this.footerRepository.create(footerData);
    return this.footerRepository.save(footer);
  }

  async update(id: number, data: UpdateFooterInput) {
    // Convert data to entity format
    const updateData: Partial<Footer> = {};
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    
    await this.footerRepository.update(id, updateData);
    return this.footerRepository.findOne({ where: { id } });
  }

  async delete(id: number) {
    await this.footerRepository.delete(id);
  }

  async findAll() {
    return this.footerRepository.find();
  }

  async findOne(id: number) {
    return this.footerRepository.findOne({ where: { id } });
  }

  async setActive(id: number) {
    // Deactivate all other footers
    await this.footerRepository.update({}, { isActive: false });
    // Activate the selected footer
    await this.footerRepository.update(id, { isActive: true });
    return this.footerRepository.findOne({ where: { id } });
  }
} 