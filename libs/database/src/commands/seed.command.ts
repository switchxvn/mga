import { Command, CommandRunner } from 'nest-commander';
import { CountryPhoneCodeSeeder } from '../seeders/country-phone-code.seeder';
import { ServiceSeeder } from '../seeders/service.seeder';
import { Logger } from '@nestjs/common';

@Command({ name: 'seed', description: 'Seed database with initial data' })
export class SeedCommand extends CommandRunner {
  private readonly logger = new Logger(SeedCommand.name);

  constructor(
    private readonly countryPhoneCodeSeeder: CountryPhoneCodeSeeder,
    private readonly serviceSeeder: ServiceSeeder
  ) {
    super();
  }

  async run(): Promise<void> {
    try {
      this.logger.log('Starting database seeding...');
      
      this.logger.log('Seeding country phone codes...');
      await this.countryPhoneCodeSeeder.seed();
      this.logger.log('Country phone codes seeded successfully');
      
      this.logger.log('Seeding services...');
      await this.serviceSeeder.seed();
      this.logger.log('Services seeded successfully');
      
      this.logger.log('Database seeding completed successfully');
      process.exit(0);
    } catch (error) {
      this.logger.error(`Error seeding database: ${error.message}`);
      process.exit(1);
    }
  }
} 