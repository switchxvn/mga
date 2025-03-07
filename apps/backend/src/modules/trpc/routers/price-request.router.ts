import { TRPCError } from '@trpc/server';
import { publicProcedure, router } from '../trpc';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { PriceRequestStatus } from '../../price-request/entities/price-request.entity';

export const priceRequestRouter = router({
  // Public procedure to create a price request
  create: publicProcedure
    .input(
      z.object({
        fullName: z.string().min(1, 'Họ tên không được để trống'),
        email: z.string().email('Email không hợp lệ'),
        phone: z.string().min(1, 'Số điện thoại không được để trống'),
        message: z.string().optional(),
        productId: z.number(),
        productName: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log('Creating price request');
        
        const priceRequest = await ctx.services.priceRequestService.create({
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          message: input.message,
          productId: input.productId,
          productName: input.productName,
        });
        
        return priceRequest;
      } catch (error) {
        ctx.logger.error(`Error creating price request: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create price request',
          cause: error,
        });
      }
    }),

  // Admin procedure to get all price requests
  getAll: publicProcedure
    .query(async ({ ctx }) => {
      try {
        ctx.logger.log('Fetching all price requests');
        return ctx.services.priceRequestService.findAll();
      } catch (error) {
        ctx.logger.error(`Error fetching all price requests: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve price requests',
          cause: error,
        });
      }
    }),

  // Admin procedure to get a price request by id
  getById: publicProcedure
    .input(z.number())
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Fetching price request by ID: ${input}`);
        return ctx.services.priceRequestService.findOne(input);
      } catch (error) {
        ctx.logger.error(`Error fetching price request by ID ${input}: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve price request',
          cause: error,
        });
      }
    }),

  // Admin procedure to get price requests by product id
  getByProductId: publicProcedure
    .input(z.number())
    .query(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Fetching price requests by product ID: ${input}`);
        return ctx.services.priceRequestService.findByProductId(input);
      } catch (error) {
        ctx.logger.error(`Error fetching price requests by product ID ${input}: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve price requests by product ID',
          cause: error,
        });
      }
    }),

  // Admin procedure to update price request status
  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum([
          PriceRequestStatus.PENDING,
          PriceRequestStatus.PROCESSED,
          PriceRequestStatus.COMPLETED,
          PriceRequestStatus.CANCELLED,
        ]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        ctx.logger.log(`Updating price request status: ${input.id} to ${input.status}`);
        return ctx.services.priceRequestService.updateStatus(input.id, input.status);
      } catch (error) {
        ctx.logger.error(`Error updating price request status: ${error instanceof Error ? error.message : String(error)}`);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update price request status',
          cause: error,
        });
      }
    }),
}); 