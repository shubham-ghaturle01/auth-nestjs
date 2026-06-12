import { BadRequestException, Injectable } from '@nestjs/common';
import { CalculateRiskDto, InstrumentType } from './dto/calculate-risk.dto';
import { RiskResultDto } from './dto/risk-result.dto';

interface InstrumentConfig {
  contractSize: number;
  displayName: string;
}

@Injectable()
export class RiskCalculatorService {
  private readonly instrumentConfigs: Record<InstrumentType, InstrumentConfig> = {
    [InstrumentType.FOREX]: { contractSize: 100000, displayName: 'Forex' },
    [InstrumentType.GOLD]: { contractSize: 100, displayName: 'Gold' },
    [InstrumentType.INDICES]: { contractSize: 1, displayName: 'Indices' },
    [InstrumentType.CRYPTO]: { contractSize: 1, displayName: 'Crypto' },
  };

  calculateRisk(dto: CalculateRiskDto): RiskResultDto {
    const { accountSize, riskPercent, entryPrice, stopLoss, instrument, currency } = dto;
    const config = this.instrumentConfigs[instrument];

    if (!config) {
      throw new BadRequestException(`Unsupported instrument: ${instrument}`);
    }

    const riskAmount = Number((accountSize * (riskPercent / 100)).toFixed(2));
    const stopDistance = Number(Math.abs(entryPrice - stopLoss).toFixed(6));

    if (stopDistance <= 0) {
      throw new BadRequestException('Stop loss and entry price must not be equal.');
    }

    const positionSize = Number((riskAmount / stopDistance).toFixed(4));
    const lotSize = Number((positionSize / config.contractSize).toFixed(4));

    return {
      riskAmount,
      positionSize,
      lotSize,
      instrument: config.displayName,
      currency: currency ?? 'USD',
      stopDistance,
    };
  }

  getSupportedInstruments(): string[] {
    return Object.values(InstrumentType);
  }
}
