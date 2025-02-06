import { Command, CommandRunner } from 'nest-commander';
import { CountryPhoneCodeSeeder } from '../seeders/country-phone-code.seeder';

@Command({ name: 'seed', description: 'Seed database with initial data' })
export class SeedCommand extends CommandRunner {
  constructor(private readonly countryPhoneCodeSeeder: CountryPhoneCodeSeeder) {
    super();
  }

  async run(): Promise<void> {
    try {
      await this.countryPhoneCodeSeeder.seed();
      console.log('Database seeding completed successfully');
    } catch (error) {
      console.error('Error seeding database:', error);
      process.exit(1);
    }
  }
} 