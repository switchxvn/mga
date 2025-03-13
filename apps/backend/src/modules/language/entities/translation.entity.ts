import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Language } from './language.entity';

@Entity('translations')
export class Translation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'language_code' })
  languageCode: string;

  @Column()
  key: string;

  @Column()
  value: string;

  @Column({ default: 'common' })
  namespace: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Language, language => language.translations)
  @JoinColumn({ name: 'language_code', referencedColumnName: 'code' })
  language: Language;
} 