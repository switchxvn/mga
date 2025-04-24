export interface IDashboardAdminService {
  getStats(): Promise<{
    revenue: number;
    revenueChange: number;
    orders: number;
    ordersChange: number;
    customers: number;
    customersChange: number;
    conversionRate: number;
    conversionRateChange: number;
  }>;
  
  getRecentActivities(limit?: number): Promise<Array<{
    id: number;
    type: string;
    description: string;
    createdAt: Date;
    userId: number;
  }>>;
} 