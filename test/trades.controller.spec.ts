import { Test, TestingModule } from '@nestjs/testing';
import { TradesController } from '../src/trades/trades.controller';
import { TradesService } from '../src/trades/trades.service';

const mockTrade = {
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
  tags: ['swing'],
  screenshotUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTradesService = {
  create: jest.fn().mockResolvedValue(mockTrade),
  findAll: jest.fn().mockResolvedValue([mockTrade]),
  update: jest.fn().mockResolvedValue(mockTrade),
  remove: jest.fn().mockResolvedValue(mockTrade),
  uploadScreenshot: jest.fn().mockResolvedValue(mockTrade),
};

describe('TradesController', () => {
  let controller: TradesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TradesController],
      providers: [{ provide: TradesService, useValue: mockTradesService }],
    }).compile();

    controller = module.get<TradesController>(TradesController);
  });

  it('should create a trade record', async () => {
    await expect(
      controller.create({
        pair: 'EUR/USD',
        tradeType: 'LONG',
        entryPrice: 1.1234,
        stopLoss: 1.1200,
        takeProfit: 1.1300,
        riskPercent: 1.0,
        lotSize: 0.1,
        profitLoss: 85.0,
        result: 'WIN',
      }),
    ).resolves.toEqual(mockTrade);
  });

  it('should list trades', async () => {
    await expect(controller.findAll({ search: 'EUR' })).resolves.toEqual([mockTrade]);
  });
});
