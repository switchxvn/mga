import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('country_phone_codes')
export class CountryPhoneCode {
  @PrimaryColumn()
  phoneCode: string;

  @Column()
  countryCode: string;

  @Column()
  countryName: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  flagIcon: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 