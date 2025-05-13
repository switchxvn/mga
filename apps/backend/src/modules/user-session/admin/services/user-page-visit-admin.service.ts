import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, Repository } from 'typeorm';
import { UserPageVisit } from '../../entities/user-page-visit.entity';
import { 
  IUserPageVisitAdminService, 
  PageVisitQueryOptions 
} from '../../interfaces/user-session-services.interface';

@Injectable()
export class UserPageVisitAdminService implements IUserPageVisitAdminService {
  private readonly logger = new Logger(UserPageVisitAdminService.name);

  constructor(
    @InjectRepository(UserPageVisit)
    private readonly userPageVisitRepository: Repository<UserPageVisit>,
  ) {}

  async findAll(options: PageVisitQueryOptions = {}): Promise<{ 
    items: UserPageVisit[]; 
    total: number; 
    page: number; 
    limit: number; 
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      sessionId,
      pageUrl,
      isLandingPage,
      isExitPage,
      startDate,
      endDate,
      orderBy = 'entryTime',
      orderDirection = 'DESC',
    } = options;

    const where: FindOptionsWhere<UserPageVisit> = {};

    if (sessionId !== undefined) {
      where.sessionId = sessionId;
    }

    if (pageUrl !== undefined) {
      where.pageUrl = pageUrl;
    }

    if (isLandingPage !== undefined) {
      where.isLandingPage = isLandingPage;
    }

    if (isExitPage !== undefined) {
      where.isExitPage = isExitPage;
    }

    if (startDate && endDate) {
      where.entryTime = Between(startDate, endDate);
    }

    const [items, total] = await this.userPageVisitRepository.findAndCount({
      where,
      order: {
        [orderBy]: orderDirection,
      },
      relations: ['session', 'session.user'],
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

  async findById(id: number): Promise<UserPageVisit | null> {
    return this.userPageVisitRepository.findOne({
      where: { id },
      relations: ['session', 'session.user'],
    });
  }

  async getTopReferrers(limit = 10): Promise<{ referrer: string; count: number }[]> {
    const result = await this.userPageVisitRepository.query(
      `SELECT referrer, COUNT(*) as count 
       FROM user_page_visits 
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
    const result = await this.userPageVisitRepository.query(
      `SELECT page_url as page, COUNT(*) as count 
       FROM user_page_visits 
       WHERE is_landing_page = true 
       GROUP BY page_url 
       ORDER BY count DESC 
       LIMIT ?`,
      [limit]
    );

    return result.map((item: any) => ({
      page: item.page,
      count: parseInt(item.count, 10),
    }));
  }

  async getTopExitPages(limit = 10): Promise<{ page: string; count: number }[]> {
    const result = await this.userPageVisitRepository.query(
      `SELECT page_url as page, COUNT(*) as count 
       FROM user_page_visits 
       WHERE is_exit_page = true 
       GROUP BY page_url 
       ORDER BY count DESC 
       LIMIT ?`,
      [limit]
    );

    return result.map((item: any) => ({
      page: item.page,
      count: parseInt(item.count, 10),
    }));
  }

  async getPageVisitMetrics(startDate?: Date, endDate?: Date): Promise<{
    totalPageViews: number;
    averageTimeOnPage: number;
    bounceRate: number;
  }> {
    let whereClause = '';
    const params: any[] = [];

    if (startDate && endDate) {
      whereClause = 'WHERE entry_time BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    // Tổng số lượt xem trang
    const totalPageViewsResult = await this.userPageVisitRepository.query(
      `SELECT COUNT(*) as count FROM user_page_visits ${whereClause}`,
      params
    );
    const totalPageViews = parseInt(totalPageViewsResult[0]?.count || '0', 10);

    // Thời gian trung bình trên trang
    const avgTimeOnPageResult = await this.userPageVisitRepository.query(
      `SELECT AVG(time_on_page) as avg_time FROM user_page_visits WHERE time_on_page > 0 ${whereClause ? 'AND ' + whereClause.substring(6) : ''}`,
      params
    );
    const averageTimeOnPage = Math.round(parseFloat(avgTimeOnPageResult[0]?.avg_time || '0'));

    // Tỷ lệ thoát (số phiên chỉ có 1 trang)
    const bounceSessionsResult = await this.userPageVisitRepository.query(
      `SELECT COUNT(DISTINCT session_id) as count
       FROM user_page_visits
       WHERE session_id IN (
         SELECT session_id
         FROM user_page_visits
         GROUP BY session_id
         HAVING COUNT(*) = 1
       ) ${whereClause ? 'AND ' + whereClause.substring(6) : ''}`,
      params
    );
    const bounceSessions = parseInt(bounceSessionsResult[0]?.count || '0', 10);

    // Tổng số phiên
    const totalSessionsResult = await this.userPageVisitRepository.query(
      `SELECT COUNT(DISTINCT session_id) as count FROM user_page_visits ${whereClause}`,
      params
    );
    const totalSessions = parseInt(totalSessionsResult[0]?.count || '0', 10);

    const bounceRate = totalSessions > 0 ? Math.round((bounceSessions / totalSessions) * 100) : 0;

    return {
      totalPageViews,
      averageTimeOnPage,
      bounceRate,
    };
  }

  async getSessionPageVisits(sessionId: string, options: PageVisitQueryOptions = {}): Promise<{
    items: UserPageVisit[];
    total: number;
  }> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'entryTime',
      orderDirection = 'ASC',
    } = options;

    const [items, total] = await this.userPageVisitRepository.findAndCount({
      where: { sessionId },
      order: {
        [orderBy]: orderDirection,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total };
  }

  async deletePageVisit(id: number): Promise<void> {
    await this.userPageVisitRepository.delete(id);
  }

  async deletePageVisitsBySessionId(sessionId: string): Promise<void> {
    await this.userPageVisitRepository.delete({ sessionId });
  }
} 