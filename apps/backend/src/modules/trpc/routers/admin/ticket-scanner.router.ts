import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, adminProcedure } from '../../procedures';

// Schema for device info
const deviceInfoSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  os: z.string().optional(),
  browser: z.string().optional(),
  ip: z.string().optional()
}).optional();

export const ticketScannerRouter = router({
  // Quét QR code vé
  scanTicket: adminProcedure
    .input(z.object({
      qrCode: z.string(),
      location: z.string().optional(),
      deviceInfo: deviceInfoSchema
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Lấy userId từ context - adminProcedure đảm bảo ctx.user tồn tại
        if (!ctx.user?.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Bạn cần đăng nhập để thực hiện chức năng này',
          });
        }
        
        const userId = ctx.user.id;
        
        console.log('Debug - scanTicket context:', {
          hasUserId: !!userId,
          userId,
          qrCode: input.qrCode,
          hasOrderAdminService: !!ctx.services.orderAdminService,
        });
        
        if (!ctx.services.orderAdminService) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Service không khả dụng, vui lòng thử lại sau',
          });
        }
        
        const result = await ctx.services.orderAdminService.scanTicket(
          input.qrCode,
          userId,
          input.location,
          input.deviceInfo
        );
        
        return result;
      } catch (error) {
        console.error('Error in scanTicket - DETAILED:', error);
        console.error('Error stack:', error.stack);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Lỗi xử lý quét vé: ' + (error.message || 'Unknown error'),
        });
      }
    }),
    
  // Lấy thông tin vé từ QR code
  getTicketByQrCode: adminProcedure
    .input(z.object({
      qrCode: z.string()
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.services.orderAdminService.findTicketByQrCode(input.qrCode);
      } catch (error) {
        console.error('Error in getTicketByQrCode:', error);
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Không tìm thấy vé với mã QR này',
        });
      }
    }),
    
  // Lấy lịch sử quét vé
  getTicketScanHistory: adminProcedure
    .input(z.object({
      orderItemId: z.number(),
      page: z.number().optional().default(1),
      pageSize: z.number().optional().default(10),
      search: z.string().optional(),
      scannerSearch: z.string().optional(),
      status: z.string().optional(),
      startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
      endDate: z.string().optional().transform(val => val ? new Date(val) : undefined)
    }))
    .query(async ({ ctx, input }) => {
      try {
        const result = await ctx.services.orderAdminService.findScanHistoryForOrderItem({
          orderItemId: input.orderItemId,
          page: input.page,
          pageSize: input.pageSize,
          search: input.search,
          scannerSearch: input.scannerSearch,
          status: input.status,
          startDate: input.startDate,
          endDate: input.endDate
        });
        
        return result;
      } catch (error) {
        console.error('Error in getTicketScanHistory:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Lỗi khi lấy lịch sử quét vé',
        });
      }
    }),
    
  // Lấy tất cả lịch sử soát vé với phân trang
  getAllTicketScans: adminProcedure
    .input(z.object({
      page: z.number().optional(),
      pageSize: z.number().optional(),
      search: z.string().optional(),
      scannerSearch: z.string().optional(),
      status: z.string().optional(),
      startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
      endDate: z.string().optional().transform(val => val ? new Date(val) : undefined)
    }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.services.orderAdminService.findAllTicketScans(input);
      } catch (error) {
        console.error('Error in getAllTicketScans:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Lỗi khi lấy dữ liệu lịch sử soát vé',
        });
      }
    }),
    
  // Lấy lịch sử quét vé với phân trang
  getScanHistory: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(10),
      query: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      try {
        // Kiểm tra xem ctx.user.id có tồn tại không
        if (!ctx.user?.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Bạn cần đăng nhập để thực hiện chức năng này',
          });
        }

        if (!ctx.services.orderAdminService) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Service không khả dụng, vui lòng thử lại sau',
          });
        }
        
        const result = await ctx.services.orderAdminService.getScanHistory(
          input.page,
          input.limit,
          input.query
        );
        
        return result;
      } catch (error) {
        console.error('Error in getScanHistory:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Lỗi khi lấy lịch sử quét vé: ' + (error.message || 'Unknown error'),
        });
      }
    }),
    
  // Lấy lịch sử quét cho một vé cụ thể
  getScanHistoryForOrderItem: adminProcedure
    .input(z.object({
      orderItemId: z.number()
    }))
    .query(async ({ ctx, input }) => {
      try {
        // Kiểm tra xem ctx.user.id có tồn tại không
        if (!ctx.user?.id) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Bạn cần đăng nhập để thực hiện chức năng này',
          });
        }

        if (!ctx.services.orderAdminService) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Service không khả dụng, vui lòng thử lại sau',
          });
        }
        
        const result = await ctx.services.orderAdminService.getScanHistoryForOrderItem(
          input.orderItemId
        );
        
        return result;
      } catch (error) {
        console.error('Error in getScanHistoryForOrderItem:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Lỗi khi lấy lịch sử quét cho vé: ' + (error.message || 'Unknown error'),
        });
      }
    }),
}); 