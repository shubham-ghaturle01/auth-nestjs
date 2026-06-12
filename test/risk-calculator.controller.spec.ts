import { Test, TestingModule } from '@nestjs/testing';
import { RiskCalculatorController } from '../src/risk-calculator/risk-calculator.controller';
import { RiskCalculatorService } from '../src/risk-calculator/risk-calculator.service';
import { InstrumentType } from '../src/risk-calculator/dto/calculate-risk.dto';

describe('RiskCalculatorController', () => {
  let controller: RiskCalculatorController;
  let service: RiskCalculatorService;

  const mockResult = {
    riskAmount: 100,
    positionSize: 10000,
    lotSize: 0.1,
    instrument: 'Forex',
    currency: 'USD',
    stopDistance: 0.01,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RiskCalculatorController],
      providers: [
        {
          provide: RiskCalculatorService,
          useValue: {
            getSupportedInstruments: jest.fn().mockReturnValue(Object.values(InstrumentType)),
            calculateRisk: jest.fn().mockReturnValue(mockResult),
          },
        },
      ],
    }).compile();

    controller = module.get<RiskCalculatorController>(RiskCalculatorController);
    service = module.get<RiskCalculatorService>(RiskCalculatorService);
  });

  it('should return supported instruments', () => {
    expect(controller.getSupportedInstruments()).toEqual(Object.values(InstrumentType));
    expect(service.getSupportedInstruments).toHaveBeenCalled();
  });

  it('should calculate risk results', () => {
    const result = controller.calculate({
      accountSize: 10000,
      riskPercent: 1,
      entryPrice: 1.1200,
      stopLoss: 1.1100,
      instrument: InstrumentType.FOREX,
    });

    expect(result).toEqual(mockResult);
    expect(service.calculateRisk).toHaveBeenCalledWith({
      accountSize: 10000,
      riskPercent: 1,
      entryPrice: 1.1200,
      stopLoss: 1.1100,
      instrument: InstrumentType.FOREX,
    });
  });
});
