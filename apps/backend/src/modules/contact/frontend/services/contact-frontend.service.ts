import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from '../../entities/contact.entity';
import type { CreateContactDto, ContactResponse } from '@ew/shared/types/contact';

@Injectable()
export class ContactFrontendService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  async create(data: CreateContactDto): Promise<ContactResponse> {
    try {
      const contact = this.contactRepository.create({
        ...data,
        status: 'pending',
      });
      await this.contactRepository.save(contact);
      
      return {
        success: true,
        message: 'Gửi liên hệ thành công!',
      };
    } catch (error) {
      console.error('Error creating contact:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra, vui lòng thử lại!',
      };
    }
  }
}
