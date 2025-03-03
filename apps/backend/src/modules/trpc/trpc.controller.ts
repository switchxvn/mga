import { Controller, All, Req, Res, NotFoundException, Param, Logger } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TrpcService } from './trpc.service';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

@Controller('trpc')
export class TrpcController {
  constructor(private readonly trpcService: TrpcService, private readonly logger: Logger) {}

  @All('*')
  async handleRequest(
    @Req() req: Request,
    @Res() res: Response,
    @Param('path') path: string,
  ) {
    try {
      // Ghi log thông tin request
      this.logger.log(`tRPC request received for path: ${path || 'root'}`);
      this.logger.debug(`Request body: ${JSON.stringify(req.body)}`);

      // Xử lý request bằng fetchRequestHandler từ tRPC
      await fetchRequestHandler({
        endpoint: '/api/trpc',
        req: req as any,
        res: res as any,
        router: this.trpcService.appRouter,
        createContext: () => this.trpcService.createContext(req, res),
        onError: ({ error, path }) => {
          this.logger.error(`Error in tRPC request to ${path}: ${error.message}`);
          this.logger.debug(error.stack);
        },
        responseMeta: ({ ctx, paths, errors, type }) => {
          // Thiết lập headers cho response
          const headers: Record<string, string> = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          };

          // Thêm header cache-control cho các query không có lỗi
          const allOk = errors.length === 0;
          const isQuery = type === 'query';
          if (allOk && isQuery) {
            headers['cache-control'] = `s-maxage=1, stale-while-revalidate=${60 * 60 * 24}`;
          }

          return { headers };
        },
      });
    } catch (error) {
      this.logger.error(`Error handling tRPC request: ${error.message}`);
      this.logger.debug(error.stack);
      
      // Trả về lỗi 500 nếu có lỗi xảy ra
      res.status(500).json({
        message: 'Internal server error',
        error: error.message,
      });
    }
  }
} 