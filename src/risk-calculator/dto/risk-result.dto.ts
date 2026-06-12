import { ApiProperty } from '@nestjs/swagger';

export class RiskResultDto {
  @ApiProperty({ example: 100 })
  riskAmount!: number;

  @ApiProperty({ example: 10000, description: 'Position size in units' })
  positionSize!: number;

  @ApiProperty({ example: 0.1, description: 'Calculated lot size for the instrument' })
  lotSize!: number;

  @ApiProperty({ example: 'FOREX' })
  instrument!: string;

  @ApiProperty({ example: 'USD', description: 'Quote currency for the output values' })
  currency!: string;

  @ApiProperty({ example: 0.0100, description: 'Price distance between entry and stop loss' })
  stopDistance!: number;
}
