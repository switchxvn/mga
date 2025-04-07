import { Command, CommandRunner, Option } from 'nest-commander';
import { CountryPhoneCodeSeeder } from '../seeders/country-phone-code.seeder';
import { ServiceSeeder } from '../seeders/service.seeder';
import { TicketProductSeeder } from '../seeders/ticket-product.seeder';
import { Logger } from '@nestjs/common';

interface SeedCommandOptions {
  seeder?: string;
}

@Command({
  name: 'seed',
  description: 'Seed database with initial data',
  options: {
    isDefault: true,
  },
})
export class SeedCommand extends CommandRunner {
  private readonly logger = new Logger(SeedCommand.name);

  constructor(
    private readonly countryPhoneCodeSeeder: CountryPhoneCodeSeeder,
    private readonly serviceSeeder: ServiceSeeder,
    private readonly ticketProductSeeder: TicketProductSeeder
  ) {
    super();
    this.logger.log('SeedCommand constructor called');
  }

  async run(
    passedParams: string[],
    options?: SeedCommandOptions
  ): Promise<void> {
    try {
      this.logger.log('Starting database seeding...');
      this.logger.log(`Passed params: ${JSON.stringify(passedParams)}`);
      this.logger.log(`Options: ${JSON.stringify(options)}`);
      
      // Nếu có tham số seeder, chỉ chạy seeder đó
      if (options?.seeder) {
        this.logger.log(`Running specific seeder: ${options.seeder}`);
        await this.runSpecificSeeder(options.seeder);
      } else {
        // Nếu không có tham số, chạy tất cả các seeders
        this.logger.log('Running all seeders');
        await this.runAllSeeders();
      }
      
      this.logger.log('Database seeding completed successfully');
      process.exit(0);
    } catch (error) {
      this.logger.error(`Error seeding database: ${error.message}`);
      this.logger.error(error.stack);
      process.exit(1);
    }
  }

  @Option({
    flags: '-s, --seeder [seederName]',
    description: 'Specific seeder to run (country-phone-code, service, ticket-product)',
  })
  parseSeeder(val: string): string {
    this.logger.log(`parseSeeder called with value: ${val}`);
    return val;
  }

  private async runSpecificSeeder(seederName: string): Promise<void> {
    this.logger.log(`runSpecificSeeder called with seeder: ${seederName}`);
    switch (seederName.toLowerCase()) {
      case 'country-phone-code':
        this.logger.log('Seeding country phone codes...');
        await this.countryPhoneCodeSeeder.seed();
        this.logger.log('Country phone codes seeded successfully');
        break;
      case 'service':
        this.logger.log('Seeding services...');
        await this.serviceSeeder.seed();
        this.logger.log('Services seeded successfully');
        break;
      case 'ticket-product':
        this.logger.log('Seeding ticket products...');
        await this.ticketProductSeeder.seed();
        this.logger.log('Ticket products seeded successfully');
        break;
      default:
        this.logger.error(`Unknown seeder: ${seederName}`);
        this.logger.log('Available seeders: country-phone-code, service, ticket-product');
        process.exit(1);
    }
  }

  private async runAllSeeders(): Promise<void> {
    this.logger.log('Seeding country phone codes...');
    await this.countryPhoneCodeSeeder.seed();
    this.logger.log('Country phone codes seeded successfully');
    
    this.logger.log('Seeding services...');
    await this.serviceSeeder.seed();
    this.logger.log('Services seeded successfully');

    this.logger.log('Seeding ticket products...');
    await this.ticketProductSeeder.seed();
    this.logger.log('Ticket products seeded successfully');
  }
} 