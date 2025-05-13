import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, LessThan, Repository } from 'typeorm';
import { UserSession } from '../../entities/user-session.entity';
import { UserPageVisit } from '../../entities/user-page-visit.entity';
import { 
  IUserSessionAdminService, 
  SessionQueryOptions 
} from '../../interfaces/user-session-services.interface';

@Injectable()
export class UserSessionAdminService implements IUserSessionAdminService {
  private readonly logger = new Logger(UserSessionAdminService.name);

  constructor(
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
    @InjectRepository(UserPageVisit)
    private readonly userPageVisitRepository: Repository<UserPageVisit>,
  ) {}

  async findAll(options: SessionQueryOptions = {}): Promise<{ 
    items: UserSession[]; 
    total: number; 
    page: number; 
    limit: number; 
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      userId,
      isActive,
      startDate,
      endDate,
      orderBy = 'lastActivity',
      orderDirection = 'DESC',
    } = options;

    const where: FindOptionsWhere<UserSession> = {};

    if (userId !== undefined) {
      where.userId = userId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (startDate && endDate) {
      where.startTime = Between(startDate, endDate);
    }

    const [items, total] = await this.userSessionRepository.findAndCount({
      where,
      order: {
        [orderBy]: orderDirection,
      },
      relations: ['user', 'pageVisits'],
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<UserSession | null> {
    return this.userSessionRepository.findOne({
      where: { id },
      relations: ['user', 'pageVisits'],
    });
  }

  async getActiveSessionsCount(): Promise<number> {
    return this.userSessionRepository.count({
      where: { isActive: true },
    });
  }

  async getSessionMetrics(startDate?: Date, endDate?: Date): Promise<{
    totalSessions: number;
    averageSessionDuration: number;
    bounceRate: number;
    newUsers: number;
    returningUsers: number;
  }> {
    let whereClause = '';
    const params: any[] = [];

    if (startDate && endDate) {
      whereClause = 'WHERE start_time BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    // Tổng số phiên
    const totalSessionsResult = await this.userSessionRepository.query(
      `SELECT COUNT(*) as count FROM user_sessions ${whereClause}`,
      params
    );
    const totalSessions = parseInt(totalSessionsResult[0]?.count || '0', 10);

    // Thời lượng trung bình phiên
    const avgDurationResult = await this.userSessionRepository.query(
      `SELECT AVG(total_time) as avg_duration FROM user_sessions ${whereClause}`,
      params
    );
    const averageSessionDuration = Math.round(parseFloat(avgDurationResult[0]?.avg_duration || '0'));

    // Tỷ lệ thoát (một phiên có 1 lượt xem trang)
    const bounceSessionIds = await this.userPageVisitRepository.query(
      `SELECT session_id FROM user_page_visits
       GROUP BY session_id
       HAVING COUNT(*) = 1`
    );
    
    const bounceSessionIdList = bounceSessionIds.map((row: any) => row.session_id);
    const bounceCount = bounceSessionIdList.length;
    const bounceRate = totalSessions > 0 ? Math.round((bounceCount / totalSessions) * 100) : 0;

    // Người dùng mới và quay lại
    const newUsersResult = await this.userSessionRepository.query(
      `SELECT COUNT(DISTINCT user_id) as count FROM user_sessions WHERE user_id IS NOT NULL ${whereClause ? 'AND ' + whereClause.substring(6) : ''}`,
      params
    );
    const newUsers = parseInt(newUsersResult[0]?.count || '0', 10);

    // Người dùng quay lại (có nhiều hơn 1 phiên)
    const returningUsersResult = await this.userSessionRepository.query(
      `SELECT COUNT(DISTINCT user_id) as count 
       FROM user_sessions 
       WHERE user_id IN (
         SELECT user_id 
         FROM user_sessions 
         WHERE user_id IS NOT NULL 
         GROUP BY user_id 
         HAVING COUNT(*) > 1
       ) ${whereClause ? 'AND ' + whereClause.substring(6) : ''}`,
      params
    );
    const returningUsers = parseInt(returningUsersResult[0]?.count || '0', 10);

    return {
      totalSessions,
      averageSessionDuration,
      bounceRate,
      newUsers,
      returningUsers,
    };
  }

  async getTopReferrers(limit = 10): Promise<{ referrer: string; count: number }[]> {
    const result = await this.userSessionRepository.query(
      `SELECT referrer, COUNT(*) as count 
       FROM user_sessions 
       WHERE referrer IS NOT NULL AND referrer != '' 
       GROUP BY referrer 
       ORDER BY count DESC 
       LIMIT ?`,
      [limit]
    );

    return result.map((item: any) => ({
      referrer: item.referrer,
      count: parseInt(item.count, 10),
    }));
  }

  async getTopLandingPages(limit = 10): Promise<{ page: string; count: number }[]> {
    const result = await this.userSessionRepository.query(
      `SELECT landing_page as page, COUNT(*) as count 
       FROM user_sessions 
       WHERE landing_page IS NOT NULL 
       GROUP BY landing_page 
       ORDER BY count DESC 
       LIMIT ?`,
      [limit]
    );

    return result.map((item: any) => ({
      page: item.page,
      count: parseInt(item.count, 10),
    }));
  }

  async getUserActivity(userId: number, options: SessionQueryOptions = {}): Promise<{
    items: UserSession[];
    total: number;
  }> {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      orderBy = 'startTime',
      orderDirection = 'DESC',
    } = options;

    const where: FindOptionsWhere<UserSession> = { userId };

    if (startDate && endDate) {
      where.startTime = Between(startDate, endDate);
    }

    const [items, total] = await this.userSessionRepository.findAndCount({
      where,
      order: {
        [orderBy]: orderDirection,
      },
      relations: ['pageVisits'],
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total };
  }

  async cleanupExpiredSessions(): Promise<number> {
    try {
      // Tìm các phiên đã hết hạn
      const currentDate = new Date();
      const expiredSessions = await this.userSessionRepository.find({
        where: {
          expireAt: LessThan(currentDate)
        },
        select: ['id', 'sessionId']
      });

      if (expiredSessions.length === 0) {
        return 0;
      }

      this.logger.log(`Found ${expiredSessions.length} expired sessions to clean up`);
      
      // Xóa tất cả các chi tiết trang liên quan đến các phiên hết hạn
      const sessionIds = expiredSessions.map(session => session.sessionId);
      
      await this.userPageVisitRepository.createQueryBuilder()
        .delete()
        .where("session_id IN (:...ids)", { ids: sessionIds })
        .execute();

      // Xóa các phiên đã hết hạn
      const result = await this.userSessionRepository.createQueryBuilder()
        .delete()
        .where("expire_at < :now", { now: currentDate })
        .execute();

      this.logger.log(`Cleaned up ${result.affected} expired sessions`);
      
      return result.affected || 0;
    } catch (error) {
      this.logger.error(`Error cleaning up expired sessions: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteSession(id: number): Promise<void> {
    const session = await this.userSessionRepository.findOne({
      where: { id },
      select: ['sessionId']
    });
    
    if (session) {
      // Xóa các lượt truy cập trang liên quan
      await this.userPageVisitRepository.delete({ sessionId: session.sessionId });
      // Xóa phiên
      await this.userSessionRepository.delete(id);
    }
  }

  async deleteSessionsByUserId(userId: number): Promise<void> {
    const sessions = await this.userSessionRepository.find({
      where: { userId },
      select: ['sessionId']
    });
    
    for (const session of sessions) {
      // Xóa các lượt truy cập trang liên quan
      await this.userPageVisitRepository.delete({ sessionId: session.sessionId });
    }
    
    // Xóa phiên
    await this.userSessionRepository.delete({ userId });
  }
} 