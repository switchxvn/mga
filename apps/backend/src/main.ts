/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { TransformInterceptor } from './modules/common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './modules/common/filters/http-exception.filter';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { join } from 'path';

async function bootstrap() {
  // Tạo Fastify adapter với các tùy chọn
  const fastifyAdapter = new FastifyAdapter({
    logger: false,
    // Tăng giới hạn kích thước body request
    bodyLimit: 10 * 1024 * 1024, // 10MB
  });

  // Tạo ứng dụng NestJS với Fastify adapter
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
    { 
      logger: ['error', 'warn', 'log', 'debug'],
      bufferLogs: true,
    }
  );
  
  const configService = app.get(ConfigService);

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global Filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Cấu hình thư mục static (nếu cần)
  try {
    app.useStaticAssets({
      root: join(__dirname, '..', 'public'),
      prefix: '/public/',
    });
    
    // Cấu hình trang chủ
    app.setViewEngine({
      engine: {
        handlebars: require('handlebars'),
      },
      templates: join(__dirname, '..', 'public'),
    });
  } catch (error) {
    console.warn('Static assets configuration failed:', error.message);
  }

  // Swagger Configuration
  const swaggerEnabled = configService.get('SWAGGER_ENABLED', 'true') === 'true';
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription('NestJS API with tRPC integration')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // CORS Configuration
  const corsEnabled = configService.get('CORS_ENABLED', 'true') === 'true';
  if (corsEnabled) {
    app.enableCors({
      origin: configService.get('CORS_ORIGINS', 'http://localhost:3000').split(','),
      credentials: true,
    });
  }

  // Global Prefix
  const apiPrefix = configService.get('API_PREFIX', 'api');
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['/'],
  });

  // Start Server
  const port = configService.get('PORT', 3000);
  await app.listen(port, 'localhost');
  
  // Tạo URL với hostname là 'localhost' thay vì địa chỉ IP
  const displayUrl = `http://localhost:${port}`;
  console.log(`Application is running on: ${displayUrl}`);
  console.log(`API is available at: ${displayUrl}/${apiPrefix}`);
  console.log(`Swagger documentation is available at: ${displayUrl}/${apiPrefix}/docs`);
  
  // Hiển thị thông tin về frontend URL
  const frontendUrl = configService.get('FRONTEND_URL', 'http://localhost:4200');
  console.log(`Frontend is expected to run at: ${frontendUrl}`);
}
bootstrap();
