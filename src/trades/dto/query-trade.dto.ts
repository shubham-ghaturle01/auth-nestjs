import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class TradeQueryDto {
  @ApiPropertyOptional({ description: 'Text search over pair, trade type, result, emotion, and notes' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by currency pair' })
  @IsOptional()
  @IsString()
  pair?: string;

  @ApiPropertyOptional({ description: 'Filter by trade type' })
  @IsOptional()
  @IsString()
  tradeType?: string;

  @ApiPropertyOptional({ description: 'Filter by result' })
  @IsOptional()
  @IsString()
  result?: string;

  @ApiPropertyOptional({ description: 'Filter by emotion' })
  @IsOptional()
  @IsString()
  emotion?: string;

  @ApiPropertyOptional({ description: 'Filter by a single tag' })
  @IsOptional()
  @IsString()
  tag?: string;
}
