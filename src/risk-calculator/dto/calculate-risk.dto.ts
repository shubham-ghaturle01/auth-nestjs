import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum InstrumentType {
  FOREX = 'FOREX',
  GOLD = 'GOLD',
  INDICES = 'INDICES',
  CRYPTO = 'CRYPTO',
}

export class CalculateRiskDto {
  @ApiProperty({ example: 10000 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  accountSize!: number;

  @ApiProperty({ example: 1.0, description: 'Risk percentage of the account balance' })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  @Max(100)
  riskPercent!: number;

  @ApiProperty({ example: 1.1200, description: 'Order entry price' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  entryPrice!: number;

  @ApiProperty({ example: 1.1100, description: 'Stop loss price' })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  stopLoss!: number;

  @ApiProperty({ enum: InstrumentType, example: InstrumentType.FOREX })
  @IsString()
  @IsEnum(InstrumentType)
  instrument!: InstrumentType;

  @ApiPropertyOptional({ example: 'USD', description: 'Quote currency for the instrument' })
  @IsString()
  currency?: string;
}
