import { Controller, All, Req, Res, NotFoundException, Param, Logger } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TrpcService } from './trpc.service';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

@Controller('trpc')
export class TrpcController {
  private readonly logger = new Logger(TrpcController.name);

  constructor(private readonly trpcService: TrpcService) {}

  @All('*')
  async handleRequest(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    try {
      // Log request details
      this.logger.debug(`Processing tRPC request: ${req.url}`);
      this.logger.debug(`Request path: ${req.url}`);
      this.logger.debug(`Request method: ${req.method}`);
      this.logger.debug(`Request headers: ${JSON.stringify(req.headers)}`);
      
      if (req.body) {
        this.logger.debug(`Request body: ${JSON.stringify(req.body)}`);
      }

      // Create context
      const ctx = await this.trpcService.createContext(req);

      // Tạo URL đầy đủ từ request
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      
      // Tạo Request object cho fetchRequestHandler
      const request = new Request(url, {
        method: req.method,
        headers: new Headers(req.headers as Record<string, string>),
        body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
      });

      // Process request
      const result = await fetchRequestHandler({
        endpoint: '/api/trpc',
        req: request,
        router: this.trpcService.getRouter(),
        createContext: () => ctx,
        onError: ({ error, path }) => {
          this.logger.error(`tRPC error on path ${path}: ${error.message}`);
          this.logger.error(error.stack);
          if (error.cause) {
            this.logger.error(`Cause: ${error.cause instanceof Error ? error.cause.message : String(error.cause)}`);
          }
        },
      });

      // Log response details
      this.logger.debug(`tRPC response status: ${result.status}`);
      
      // Lấy headers từ response
      const headers: Record<string, string> = {};
      result.headers.forEach((value, key) => {
        headers[key] = value;
      });
      
      this.logger.debug(`tRPC response headers: ${JSON.stringify(headers)}`);
      
      // Set response headers
      Object.entries(headers).forEach(([key, value]) => {
        if (value !== undefined) {
          res.header(key, value);
        }
      });

      // Set CORS headers
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      // Set cache control headers
      res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.header('Pragma', 'no-cache');
      res.header('Expires', '0');

      // Send response
      res.status(result.status);
      
      // Log response body for debugging
      const responseBody = await result.text();
      this.logger.debug(`Response body: ${responseBody.substring(0, 200)}${responseBody.length > 200 ? '...' : ''}`);
      
      res.send(responseBody);
    } catch (error) {
      this.logger.error(`Error handling tRPC request: ${error instanceof Error ? error.message : String(error)}`);
      if (error instanceof Error) {
        this.logger.error(error.stack);
      }
      
      res.status(500).send({
        message: 'Internal Server Error in tRPC handler',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
} 