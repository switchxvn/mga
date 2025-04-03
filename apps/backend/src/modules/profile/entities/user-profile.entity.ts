import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { CountryPhoneCode } from '../../common/entities/country-phone-code.entity';

@Entity('user_profiles')
export class UserProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @OneToOne(() => User, user => user.profile, { lazy: true })
  @JoinColumn({ name: 'user_id' })
  user: Promise<User>;

  @Column({ name: 'first_name', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  lastName: string;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column({ name: 'phone_code', nullable: true })
  phoneCode: string;

  @Column({ name: 'bio', nullable: true })
  bio: string;

  @ManyToOne(() => CountryPhoneCode, { nullable: true, lazy: true })
  @JoinColumn({ name: 'phone_code', referencedColumnName: 'phoneCode' })
  countryPhoneCode: Promise<CountryPhoneCode>;

  @Column({ nullable: true, type: 'json' })
  address: {
    street: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    zipCode: string | null;
  } | null;
  
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 