import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('country_phone_codes')
export class CountryPhoneCode {
  @PrimaryColumn({ name: 'phone_code' })
  phoneCode: string;

  @Column({ name: 'country_code' })
  countryCode: string;

  @Column({ name: 'country_name' })
  countryName: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'flag_icon', nullable: true })
  flagIcon: string;

  @Column({ name: 'flag_emoji', nullable: true })
  flagEmoji: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 