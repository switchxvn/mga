import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { FastifyReply } from 'fastify';
import { join } from 'path';
import * as fs from 'fs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getIndex(@Res() res: FastifyReply) {
    try {
      const indexPath = join(__dirname, '..', 'public', 'index.html');
      const content = fs.readFileSync(indexPath, 'utf8');
      res.header('Content-Type', 'text/html');
      return res.send(content);
    } catch (error) {
      return res.send(this.appService.getHello());
    }
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'nestjs-api',
    };
  }
}
