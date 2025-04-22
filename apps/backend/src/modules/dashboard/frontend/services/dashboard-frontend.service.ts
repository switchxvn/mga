import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DashboardStats } from '../../entities/dashboard-stats.entity';

@Injectable()
export class DashboardFrontendService {
  private readonly logger = new Logger(DashboardFrontendService.name);

  constructor(
    @InjectRepository(DashboardStats)
    private dashboardStatsRepository: Repository<DashboardStats>
  ) {}

  async getPublicStats(): Promise<Partial<DashboardStats>> {
    try {
      // Get the latest stats
      const stats = await this.dashboardStatsRepository.findOne({
        order: { createdAt: 'DESC' }
      });

      if (!stats) {
        return {};
      }

      // Return only public stats
      return {
        conversionRate: stats.conversionRate,
        customers: stats.customers,
      };
    } catch (error) {
      this.logger.error('Failed to fetch public dashboard stats:', error);
      throw error;
    }
  }

  async getPublicActivities(limit = 5): Promise<any[]> {
    try {
      // This is a placeholder. Implement logic to get public activities
      // For example: Recent blog posts, public announcements, etc.
      return [];
    } catch (error) {
      this.logger.error('Failed to fetch public activities:', error);
      throw error;
    }
  }
} 