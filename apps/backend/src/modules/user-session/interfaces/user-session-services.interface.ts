import { UserSession } from "../entities/user-session.entity";
import { UserPageVisit } from "../entities/user-page-visit.entity";

export interface CreateSessionData {
  sessionId: string;
  userId?: number | null;
  ipAddress?: string;
  country?: string;
  userAgent?: string;
  deviceInfo?: Record<string, any>;
  ttl?: number;
}

export interface UpdateSessionData {
  lastActivity?: Date | string;
  totalTime?: number;
  isActive?: boolean;
  expireAt?: Date;
  country?: string;
}

export interface CreatePageVisitData {
  sessionId: string;
  pageUrl: string;
  referrer?: string;
  isLandingPage?: boolean;
}

export interface UpdatePageVisitData {
  exitTime?: Date;
  timeOnPage?: number;
  isExitPage?: boolean;
}

export interface SessionQueryOptions {
  page?: number;
  limit?: number;
  userId?: number;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

export interface PageVisitQueryOptions {
  page?: number;
  limit?: number;
  sessionId?: string;
  pageUrl?: string;
  isLandingPage?: boolean;
  isExitPage?: boolean;
  startDate?: Date;
  endDate?: Date;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

export interface IUserSessionAdminService {
  findAll(options: SessionQueryOptions): Promise<{ 
    items: UserSession[]; 
    total: number; 
    page: number; 
    limit: number; 
    totalPages: number;
  }>;
  
  findById(id: number): Promise<UserSession | null>;
  
  getActiveSessionsCount(): Promise<number>;
  
  getSessionMetrics(startDate?: Date, endDate?: Date): Promise<{
    totalSessions: number;
    averageSessionDuration: number;
    bounceRate: number;
    newUsers: number;
    returningUsers: number;
  }>;
  
  getUserActivity(userId: number, options?: SessionQueryOptions): Promise<{
    items: UserSession[];
    total: number;
  }>;
  
  deleteSession(id: number): Promise<void>;
  
  deleteSessionsByUserId(userId: number): Promise<void>;
  
  cleanupExpiredSessions(): Promise<number>;
}

export interface IUserSessionFrontendService {
  startSession(data: CreateSessionData): Promise<UserSession>;
  
  updateSession(sessionId: string, data: UpdateSessionData): Promise<UserSession | null>;
  
  endSession(sessionId: string): Promise<UserSession | null>;
  
  getSession(sessionId: string): Promise<UserSession | null>;
  
  getActiveUserCount(): Promise<number>;
  
  refreshSession(sessionId: string, ttl?: number): Promise<UserSession | null>;
}

export interface IUserPageVisitAdminService {
  findAll(options: PageVisitQueryOptions): Promise<{ 
    items: UserPageVisit[]; 
    total: number; 
    page: number; 
    limit: number; 
    totalPages: number;
  }>;
  
  findById(id: number): Promise<UserPageVisit | null>;
  
  getTopReferrers(limit?: number): Promise<{ referrer: string; count: number }[]>;
  
  getTopLandingPages(limit?: number): Promise<{ page: string; count: number }[]>;
  
  getTopExitPages(limit?: number): Promise<{ page: string; count: number }[]>;
  
  getPageVisitMetrics(startDate?: Date, endDate?: Date): Promise<{
    totalPageViews: number;
    averageTimeOnPage: number;
    bounceRate: number;
  }>;
  
  getSessionPageVisits(sessionId: string, options?: PageVisitQueryOptions): Promise<{
    items: UserPageVisit[];
    total: number;
  }>;
  
  deletePageVisit(id: number): Promise<void>;
  
  deletePageVisitsBySessionId(sessionId: string): Promise<void>;
}

export interface IUserPageVisitFrontendService {
  recordPageVisit(data: CreatePageVisitData): Promise<UserPageVisit>;
  
  updatePageVisit(id: number, data: UpdatePageVisitData): Promise<UserPageVisit | null>;
  
  completePageVisit(id: number, exitTime?: Date): Promise<UserPageVisit | null>;
  
  getPageVisit(id: number): Promise<UserPageVisit | null>;
  
  getCurrentPageVisit(sessionId: string): Promise<UserPageVisit | null>;
} 