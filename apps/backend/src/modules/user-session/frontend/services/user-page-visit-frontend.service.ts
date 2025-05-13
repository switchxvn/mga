import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { UserPageVisit } from '../../entities/user-page-visit.entity';
import { 
  CreatePageVisitData, 
  IUserPageVisitFrontendService, 
  UpdatePageVisitData 
} from '../../interfaces/user-session-services.interface';

@Injectable()
export class UserPageVisitFrontendService implements IUserPageVisitFrontendService {
  private readonly logger = new Logger(UserPageVisitFrontendService.name);

  constructor(
    @InjectRepository(UserPageVisit)
    private readonly userPageVisitRepository: Repository<UserPageVisit>,
  ) {}

  async recordPageVisit(data: CreatePageVisitData): Promise<UserPageVisit> {
    try {
      // Đóng trang truy cập hiện tại (nếu có)
      const currentVisit = await this.getCurrentPageVisit(data.sessionId);
      if (currentVisit) {
        await this.completePageVisit(currentVisit.id);
      }

      // Tạo bản ghi mới cho trang truy cập
      const pageVisit = this.userPageVisitRepository.create({
        sessionId: data.sessionId,
        pageUrl: data.pageUrl,
        referrer: data.referrer || null,
        entryTime: new Date(),
        isLandingPage: data.isLandingPage || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return this.userPageVisitRepository.save(pageVisit);
    } catch (error) {
      this.logger.error(`Error recording page visit: ${error.message}`, error.stack);
      throw error;
    }
  }

  async updatePageVisit(id: number, data: UpdatePageVisitData): Promise<UserPageVisit | null> {
    try {
      const pageVisit = await this.userPageVisitRepository.findOne({
        where: { id },
      });

      if (!pageVisit) {
        return null;
      }

      if (data.exitTime) {
        pageVisit.exitTime = data.exitTime;
        
        // Tính thời gian ở trên trang
        const entryTime = pageVisit.entryTime;
        const exitTime = data.exitTime;
        const diffSeconds = Math.floor((exitTime.getTime() - entryTime.getTime()) / 1000);
        
        // Cập nhật thời gian ở trên trang nếu hợp lý
        if (diffSeconds > 0 && diffSeconds < 3600) {
          pageVisit.timeOnPage = diffSeconds;
        }
      }

      if (data.timeOnPage !== undefined) {
        pageVisit.timeOnPage = data.timeOnPage;
      }

      if (data.isExitPage !== undefined) {
        pageVisit.isExitPage = data.isExitPage;
      }

      pageVisit.updatedAt = new Date();

      return this.userPageVisitRepository.save(pageVisit);
    } catch (error) {
      this.logger.error(`Error updating page visit: ${error.message}`, error.stack);
      throw error;
    }
  }

  async completePageVisit(id: number, exitTime?: Date): Promise<UserPageVisit | null> {
    try {
      const currentTime = exitTime || new Date();
      
      return this.updatePageVisit(id, {
        exitTime: currentTime,
        isExitPage: true,
      });
    } catch (error) {
      this.logger.error(`Error completing page visit: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getPageVisit(id: number): Promise<UserPageVisit | null> {
    return this.userPageVisitRepository.findOne({
      where: { id },
      relations: ['session'],
    });
  }

  async getCurrentPageVisit(sessionId: string): Promise<UserPageVisit | null> {
    return this.userPageVisitRepository.findOne({
      where: {
        sessionId,
        exitTime: IsNull(),
      },
      order: {
        entryTime: 'DESC',
      },
    });
  }
} 