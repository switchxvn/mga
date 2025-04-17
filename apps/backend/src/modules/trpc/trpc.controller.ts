import { Controller, All, Req, Res, NotFoundException, Param, Logger } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TrpcService } from './trpc.service';
import { TrpcRouter } from './trpc.router';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

@Controller('trpc')
export class TrpcController {
  private readonly logger = new Logger(TrpcController.name);

  constructor(
    private readonly trpcService: TrpcService,
    private readonly trpcRouter: TrpcRouter
  ) {}

  @All('*')
  async handleRequest(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    try {
      // Handle CORS preflight
      if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.header('Access-Control-Max-Age', '86400'); // 24 hours
        return res.status(204).send();
      }

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

      // Create full URL from request
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
      
      // Create Request object for fetchRequestHandler
      const request = new Request(url, {
        method: req.method,
        headers: new Headers({
          ...req.headers as Record<string, string>,
          'Content-Type': 'application/json',
        }),
        body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
      });

      // Process request
      const result = await fetchRequestHandler({
        endpoint: '/api/trpc',
        req: request,
        router: this.trpcRouter.getRouter(),
        createContext: () => ctx,
        batching: {
          enabled: true,
        },
        onError: ({ error, path }) => {
          this.logger.error(`tRPC error on path ${path}: ${error.message}`);
          this.logger.error(error.stack);
          if (error.cause) {
            this.logger.error(`Cause: ${error.cause instanceof Error ? error.cause.message : String(error.cause)}`);
          }
        },
      });

      // Set response headers
      result.headers.forEach((value, key) => {
        res.header(key, value);
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
      const responseBody = await result.text();
      
      // Set content type for JSON response
      res.header('Content-Type', 'application/json');
      
      try {
        // Parse and re-stringify to ensure valid JSON
        const parsedBody = JSON.parse(responseBody);
        return res.send(parsedBody);
      } catch {
        // If parsing fails, send raw response
        return res.send(responseBody);
      }
    } catch (error) {
      this.logger.error(`Error handling tRPC request: ${error instanceof Error ? error.message : String(error)}`);
      if (error instanceof Error) {
        this.logger.error(error.stack);
      }
      
      return res.status(500).send({
        message: 'Internal Server Error in tRPC handler',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
} 