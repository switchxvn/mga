import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { AboutSectionTranslation } from './about-section-translation.entity';

export enum AboutSectionType {
  HERO = 'hero',
  CONTENT = 'content',
  TEAM = 'team',
  MILESTONE = 'milestone',
  STATS = 'stats',
  GALLERY = 'gallery'
}

@Entity('about_sections')
export class AboutSection {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'enum',
    enum: AboutSectionType,
    default: AboutSectionType.CONTENT
  })
  type!: AboutSectionType;

  @Column({ length: 100 })
  componentName!: string;

  @Column({ type: 'int', default: 0 })
  order!: number;

  @Column({ type: 'jsonb', default: {
    // Common settings
    layout: 'default',
    backgroundColor: '',
    textColor: '',
    padding: '4rem 0',
    
    // Hero section
    heroHeight: '500px',
    heroBackgroundImage: '',
    heroOverlayOpacity: 0.5,
    
    // Content section
    contentLayout: 'text-image', // text-image | image-text | text-only
    imageUrl: '',
    imagePosition: 'right',
    imageWidth: '50%',
    
    // Team section
    teamLayout: 'grid',
    teamColumns: 3,
    teamMembers: [], // Array of { name, position, imageUrl, bio, socialLinks }
    
    // Milestone section
    milestoneLayout: 'timeline',
    milestones: [], // Array of { year, title, description, imageUrl }
    
    // Stats section
    statsLayout: 'grid',
    statsColumns: 4,
    stats: [], // Array of { value, label, icon }
    
    // Gallery section
    galleryLayout: 'grid',
    galleryColumns: 3,
    galleryImages: [], // Array of { url, caption }
    
    // Animation
    animation: {
      enabled: true,
      type: 'fade-up',
      duration: 1000,
      delay: 0
    }
  }})
  settings!: Record<string, any>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => AboutSectionTranslation, translation => translation.section, { 
    cascade: true,
    eager: true 
  })
  translations!: AboutSectionTranslation[];
} 