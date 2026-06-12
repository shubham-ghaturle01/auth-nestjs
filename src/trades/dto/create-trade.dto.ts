import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateTradeDto {
  @ApiProperty({ example: 'EUR/USD' })
  @IsString()
  @IsNotEmpty()
  pair!: string;

  @ApiProperty({ example: 'LONG' })
  @IsString()
  @IsNotEmpty()
  @IsIn(['LONG', 'SHORT'])
  tradeType!: string;

  @ApiProperty({ example: 1.1250 })
  @Type(() => Number)
  @IsNumber()
  entryPrice!: number;

  @ApiProperty({ example: 1.1200 })
  @Type(() => Number)
  @IsNumber()
  stopLoss!: number;

  @ApiProperty({ example: 1.1300 })
  @Type(() => Number)
  @IsNumber()
  takeProfit!: number;

  @ApiProperty({ example: 1.5 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  riskPercent!: number;

  @ApiProperty({ example: 0.1 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  lotSize!: number;

  @ApiProperty({ example: 120.5 })
  @Type(() => Number)
  @IsNumber()
  profitLoss!: number;

  @ApiProperty({ example: 'WIN' })
  @IsString()
  @IsNotEmpty()
  @IsIn(['WIN', 'LOSS', 'BREAKEVEN'])
  result!: string;

  @ApiPropertyOptional({ example: 'Confident' })
  @IsString()
  @IsOptional()
  emotion?: string;

  @ApiPropertyOptional({ example: 'Held for 3 hours, broke above resistance' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: ['swing', 'news'] })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
}
