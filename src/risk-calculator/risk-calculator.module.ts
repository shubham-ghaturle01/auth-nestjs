import { Module } from '@nestjs/common';
import { RiskCalculatorController } from './risk-calculator.controller';
import { RiskCalculatorService } from './risk-calculator.service';

@Module({
  controllers: [RiskCalculatorController],
  providers: [RiskCalculatorService],
})
export class RiskCalculatorModule {}
