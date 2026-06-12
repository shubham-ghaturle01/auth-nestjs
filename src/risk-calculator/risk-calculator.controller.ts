import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RiskCalculatorService } from './risk-calculator.service';
import { CalculateRiskDto } from './dto/calculate-risk.dto';
import { RiskResultDto } from './dto/risk-result.dto';

@Controller('risk-calculator')
@ApiTags('risk-calculator')
export class RiskCalculatorController {
  constructor(private readonly calculatorService: RiskCalculatorService) {}

  @Get('instruments')
  @ApiOperation({ summary: 'List supported instrument types' })
  @ApiOkResponse({ description: 'Supported instruments', type: String, isArray: true })
  getSupportedInstruments(): string[] {
    return this.calculatorService.getSupportedInstruments();
  }

  @Post('calculate')
  @ApiOperation({ summary: 'Calculate risk amount, position size, and lot size' })
  @ApiOkResponse({ description: 'Calculated risk data', type: RiskResultDto })
  @ApiBadRequestResponse({ description: 'Invalid calculation request' })
  calculate(@Body() calculateRiskDto: CalculateRiskDto): RiskResultDto {
    return this.calculatorService.calculateRisk(calculateRiskDto);
  }
}
