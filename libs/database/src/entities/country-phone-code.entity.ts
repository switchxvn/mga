import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn } from 'typeorm';

@Entity('country_phone_codes')
export class CountryPhoneCode {
  @PrimaryColumn({ name: 'phone_code', length: 4 })
  phoneCode: string;

  @Column({ name: 'country_code', length: 2 })
  countryCode: string;

  @Column({ name: 'country_name' })
  countryName: string;

  @Column({ name: 'flag_emoji', nullable: true })
  flagEmoji: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 