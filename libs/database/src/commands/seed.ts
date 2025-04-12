import { Module } from '@nestjs/common';
import { CommandFactory } from 'nest-commander';
import { DatabaseModule } from '../database.module';
import { SeedCommand } from './seed.command';
import { CountryPhoneCodeSeeder } from '../seeders/country-phone-code.seeder';
import { ServiceSeeder } from '../seeders/service.seeder';
import { TicketProductSeeder } from '../seeders/ticket-product.seeder';
import { AboutSectionSeeder } from '../seeders/about-section.seeder';
import { TourismAboutSectionSeeder } from '../seeders/tourism-about-section.seeder';
import { ContactSectionSeeder } from '../seeders/contact-section.seeder';
import { Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../../../apps/backend/src/modules/product/entities/product.entity';
import { ProductTranslation } from '../../../../apps/backend/src/modules/product/entities/product-translation.entity';
import { ProductVariant } from '../../../../apps/backend/src/modules/product/entities/product-variant.entity';
import { ProductVariantTranslation } from '../../../../apps/backend/src/modules/product/entities/product-variant-translation.entity';
import { ProductAttribute } from '../../../../apps/backend/src/modules/product/entities/product-attribute.entity';
import { ProductAttributeTranslation } from '../../../../apps/backend/src/modules/product/entities/product-attribute-translation.entity';
import { ProductAttributeValue } from '../../../../apps/backend/src/modules/product/entities/product-attribute-value.entity';
import { ProductAttributeValueTranslation } from '../../../../apps/backend/src/modules/product/entities/product-attribute-value-translation.entity';
import { CountryPhoneCode } from '../../../../apps/backend/src/modules/common/entities/country-phone-code.entity';
import { Service } from '../../../../apps/backend/src/modules/service/entities/service.entity';
import { ServiceTranslation } from '../../../../apps/backend/src/modules/service/entities/service-translation.entity';
import { AboutSection } from '../../../../apps/backend/src/modules/about/entities/about-section.entity';
import { AboutSectionTranslation } from '../../../../apps/backend/src/modules/about/entities/about-section-translation.entity';
import { ContactSection } from '../../../../apps/backend/src/modules/contact/entities/contact-section.entity';
import { ContactSectionTranslation } from '../../../../apps/backend/src/modules/contact/entities/contact-section-translation.entity';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([
      Product,
      ProductTranslation,
      ProductVariant,
      ProductVariantTranslation,
      ProductAttribute,
      ProductAttributeTranslation,
      ProductAttributeValue,
      ProductAttributeValueTranslation,
      CountryPhoneCode,
      Service,
      ServiceTranslation,
      AboutSection,
      AboutSectionTranslation,
      ContactSection,
      ContactSectionTranslation,
    ]),
  ],
  providers: [
    SeedCommand, 
    CountryPhoneCodeSeeder, 
    ServiceSeeder, 
    TicketProductSeeder,
    AboutSectionSeeder,
    TourismAboutSectionSeeder,
    ContactSectionSeeder
  ],
})
class SeedModule {}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  logger.log('Starting seed application...');
  
  try {
    logger.log('Initializing CommandFactory...');
    logger.log('Process arguments:', process.argv);
    
    await CommandFactory.run(SeedModule, ['error', 'warn', 'log', 'debug', 'verbose']);
    logger.log('CommandFactory completed successfully');
  } catch (error) {
    logger.error(`Error during bootstrap: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
  }
}

bootstrap(); 