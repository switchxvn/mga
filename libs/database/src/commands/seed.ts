import { Module } from '@nestjs/common';
import { CommandFactory } from 'nest-commander';
import { DatabaseModule } from '../database.module';
import { SeedCommand } from './seed.command';
import { CountryPhoneCodeSeeder } from '../seeders/country-phone-code.seeder';
import { ServiceSeeder } from '../seeders/service.seeder';

@Module({
  imports: [DatabaseModule],
  providers: [SeedCommand, CountryPhoneCodeSeeder, ServiceSeeder],
})
class SeedModule {}

async function bootstrap() {
  await CommandFactory.run(SeedModule);
}

bootstrap(); 