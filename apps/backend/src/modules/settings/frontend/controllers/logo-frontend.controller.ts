import { Controller } from '@nestjs/common';
import { LogoFrontendService } from '../services/logo-frontend.service';
import { z } from 'zod';

@Controller()
export class LogoFrontendController {
  constructor(private readonly logoService: LogoFrontendService) {}

} 