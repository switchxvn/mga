import { Module } from '@nestjs/common';
import { CommandFactory } from 'nest-commander';
import { DatabaseModule } from '@ew/database';
import { ServicesModule } from '../../services/services.module';
import { SeedCommand } from './seed.command';
import { CountryPhoneCodeSeeder } from '../seeders/country-phone-code.seeder';

@Module({
  imports: [DatabaseModule, ServicesModule],
  providers: [SeedCommand, CountryPhoneCodeSeeder],
})
class SeedModule {}

async function bootstrap() {
  await CommandFactory.run(SeedModule);
}

bootstrap(); 