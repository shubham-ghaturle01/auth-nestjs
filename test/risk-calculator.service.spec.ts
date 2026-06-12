import { Test, TestingModule } from '@nestjs/testing';
import { RiskCalculatorService } from '../src/risk-calculator/risk-calculator.service';
import { InstrumentType } from '../src/risk-calculator/dto/calculate-risk.dto';

describe('RiskCalculatorService', () => {
  let service: RiskCalculatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RiskCalculatorService],
    }).compile();

    service = module.get<RiskCalculatorService>(RiskCalculatorService);
  });

  it('should calculate forex risk correctly', () => {
    const result = service.calculateRisk({
      accountSize: 10000,
      riskPercent: 1,
      entryPrice: 1.1200,
      stopLoss: 1.1100,
      instrument: InstrumentType.FOREX,
      currency: 'USD',
    });

    expect(result).toEqual({
      riskAmount: 100,
      positionSize: 10000,
      lotSize: 0.1,
      instrument: 'Forex',
      currency: 'USD',
      stopDistance: 0.01,
    });
  });

  it('should calculate gold risk correctly', () => {
    const result = service.calculateRisk({
      accountSize: 20000,
      riskPercent: 0.5,
      entryPrice: 2000,
      stopLoss: 1990,
      instrument: InstrumentType.GOLD,
    });

    expect(result).toEqual({
      riskAmount: 100,
      positionSize: 10,
      lotSize: 0.1,
      instrument: 'Gold',
      currency: 'USD',
      stopDistance: 10,
    });
  });

  it('should calculate indices risk correctly', () => {
    const result = service.calculateRisk({
      accountSize: 50000,
      riskPercent: 2,
      entryPrice: 4200,
      stopLoss: 4180,
      instrument: InstrumentType.INDICES,
    });

    expect(result).toEqual({
      riskAmount: 1000,
      positionSize: 50,
      lotSize: 50,
      instrument: 'Indices',
      currency: 'USD',
      stopDistance: 20,
    });
  });

  it('should calculate crypto risk correctly', () => {
    const result = service.calculateRisk({
      accountSize: 15000,
      riskPercent: 1,
      entryPrice: 30000,
      stopLoss: 29000,
      instrument: InstrumentType.CRYPTO,
      currency: 'USD',
    });

    expect(result).toEqual({
      riskAmount: 150,
      positionSize: 0.15,
      lotSize: 0.15,
      instrument: 'Crypto',
      currency: 'USD',
      stopDistance: 1000,
    });
  });

  it('should throw when entry price and stop loss are equal', () => {
    expect(() =>
      service.calculateRisk({
        accountSize: 10000,
        riskPercent: 1,
        entryPrice: 1.1200,
        stopLoss: 1.1200,
        instrument: InstrumentType.FOREX,
      }),
    ).toThrowError('Stop loss and entry price must not be equal.');
  });
});
