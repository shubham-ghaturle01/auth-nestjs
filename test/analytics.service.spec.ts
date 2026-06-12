import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from '../src/analytics/analytics.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      trade: {
        findMany: jest.fn(),
      },
    };

    // instantiate service directly with mocked prisma
    service = new AnalyticsService(prismaMock as any);
  });

  it('computes summary metrics correctly', async () => {
    prismaMock.trade.findMany.mockResolvedValue([
      { profitLoss: 100, createdAt: new Date('2026-01-01T00:00:00Z') },
      { profitLoss: -50, createdAt: new Date('2026-01-02T00:00:00Z') },
      { profitLoss: 200, createdAt: new Date('2026-02-01T00:00:00Z') },
    ]);

    const res = await service.summary();
    expect(res.totalTrades).toBe(3);
    expect(res.winRate).toBeCloseTo((2 / 3) * 100, 2);
    expect(res.averageProfit).toBeGreaterThan(0);
    expect(res.averageLoss).toBeLessThan(0);
  });
});
