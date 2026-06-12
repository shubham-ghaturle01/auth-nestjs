import { Test, TestingModule } from '@nestjs/testing';
import { TradesService } from '../src/trades/trades.service';
import { PrismaService } from '../src/prisma/prisma.service';

describe('TradesService', () => {
  let service: TradesService;
  let prisma: any;

  const trade = {
    id: 'trade-id',
    pair: 'EUR/USD',
    tradeType: 'LONG',
    entryPrice: 1.1234,
    stopLoss: 1.1200,
    takeProfit: 1.1300,
    riskPercent: 1.0,
    lotSize: 0.1,
    profitLoss: 85.0,
    result: 'WIN',
    emotion: 'Confident',
    notes: 'Example trade',
    tags: ['swing', 'news'],
    screenshotUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      trade: {
        create: jest.fn().mockResolvedValue(trade),
        findMany: jest.fn().mockResolvedValue([trade]),
        findUnique: jest.fn().mockResolvedValue(trade),
        update: jest.fn().mockResolvedValue(trade),
        delete: jest.fn().mockResolvedValue(trade),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TradesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<TradesService>(TradesService);
  });

  it('should create a trade', async () => {
    await expect(
      service.create({
        pair: 'EUR/USD',
        tradeType: 'LONG',
        entryPrice: 1.1234,
        stopLoss: 1.1200,
        takeProfit: 1.1300,
        riskPercent: 1.0,
        lotSize: 0.1,
        profitLoss: 85.0,
        result: 'WIN',
        emotion: 'Confident',
        notes: 'Example trade',
        tags: ['swing'],
      }),
    ).resolves.toEqual(trade);
  });

  it('should return trades with search filters', async () => {
    await expect(service.findAll({ search: 'EUR' })).resolves.toEqual([trade]);
    expect(prisma.trade.findMany).toHaveBeenCalled();
  });

  it('should update a trade', async () => {
    await expect(service.update('trade-id', { result: 'LOSS' })).resolves.toEqual(trade);
    expect(prisma.trade.update).toHaveBeenCalledWith({ where: { id: 'trade-id' }, data: { result: 'LOSS' } });
  });

  it('should delete a trade', async () => {
    await expect(service.remove('trade-id')).resolves.toEqual(trade);
  });
});
