import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../../entities/contact.entity';

@Injectable()
export class ContactAdminService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  async findAll() {
    return this.contactRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string) {
    return this.contactRepository.findOne({
      where: { id },
    });
  }

  async updateStatus(id: string, status: string) {
    await this.contactRepository.update(id, { status });
    return this.findOne(id);
  }

  async delete(id: string) {
    const contact = await this.findOne(id);
    if (!contact) {
      throw new Error('Contact not found');
    }
    await this.contactRepository.delete(id);
    return contact;
  }
} 