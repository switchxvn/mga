import { Controller, All, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { TRPCError } from '@trpc/server';
import { appRouter } from './routers/_app';
import { createContext } from './context';
import { resolveHTTPResponse } from '@trpc/server/http';

@Controller('trpc')
export class TrpcController {
  @All('*')
  async handle(@Req() req: Request, @Res() res: Response) {
    const query = new URLSearchParams();
    Object.entries(req.query).forEach(([key, value]) => {
      if (typeof value === 'string') {
        query.append(key, value);
      }
    });

    const { status, headers, body } = await resolveHTTPResponse({
      router: appRouter,
      createContext: () => createContext({ req, res }),
      path: req.path.substring(6),
      req: {
        method: req.method,
        headers: req.headers,
        query,
        body: req.body,
      },
      onError({ error }) {
        if (error instanceof TRPCError) {
          console.error('tRPC error:', error);
          return error;
        }
        return new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Internal server error',
        });
      },
    });

    Object.entries(headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        res.setHeader(key, value);
      }
    });

    return res.status(status).send(body);
  }
} 