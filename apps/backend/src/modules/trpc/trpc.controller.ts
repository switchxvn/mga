import { Controller, All, Req, Res, NotFoundException } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TrpcService } from './trpc.service';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

@Controller('trpc/:path')
export class TrpcController {
  constructor(private readonly trpcService: TrpcService) {}

  @All()
  async handleRequest(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ) {
    try {
      // Kiểm tra và trích xuất path từ params
      const params = req.params as Record<string, string>;
      if (!params || !params.path) {
        throw new NotFoundException('tRPC path not found');
      }
      
      const path = params.path;
      
      // Create context
      const context = await this.trpcService.createContext(req);

      // Process request through tRPC using fetchRequestHandler
      const response = await fetchRequestHandler({
        router: this.trpcService.getRouter(),
        req: new Request(`http://localhost/trpc/${path}`, {
          method: req.method,
          headers: new Headers(req.headers as Record<string, string>),
          body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
        }),
        createContext: () => context,
        endpoint: '/trpc',
        onError: ({ error }) => {
          console.error('tRPC error:', error);
        },
      });

      // Extract response data
      const status = response.status;
      
      // Get headers safely
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      
      const body = await response.text();

      // Set response headers
      Object.keys(headers).forEach((key) => {
        res.header(key, headers[key]);
      });

      // Set status and send response
      res.status(status);
      return res.send(body);
    } catch (error: unknown) {
      console.error('Error handling tRPC request:', error);
      res.status(500).send({
        message: 'Internal server error processing tRPC request',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
} 