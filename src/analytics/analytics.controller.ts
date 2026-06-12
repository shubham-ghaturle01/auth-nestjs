import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@Controller('analytics')
@ApiTags('analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('summary')
  @ApiOkResponse({ description: 'Summary analytics' })
  summary(@Query() query: AnalyticsQueryDto) {
    return this.service.summary(query.from, query.to);
  }

  @Get('monthly')
  @ApiOkResponse({ description: 'Monthly performance' })
  monthly(@Query() query: AnalyticsQueryDto) {
    return this.service.monthlyPerformance(query.from, query.to);
  }

  @Get('equity')
  @ApiOkResponse({ description: 'Equity curve' })
  equity(@Query() query: AnalyticsQueryDto) {
    return this.service.equityCurve(query.from, query.to);
  }

  @Get('winrate-trend')
  @ApiOkResponse({ description: 'Win rate trend' })
  winrate(@Query() query: AnalyticsQueryDto) {
    return this.service.winRateTrend(query.from, query.to);
  }
}
