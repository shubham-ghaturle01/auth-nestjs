import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  private async fetchTrades(from?: string, to?: string) {
    const where: any = {};
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }
    return this.prisma.trade.findMany({ where, orderBy: { createdAt: 'asc' } });
  }

  async summary(from?: string, to?: string) {
    const trades = await this.fetchTrades(from, to);
    const total = trades.length;
    const wins = trades.filter((t) => t.profitLoss > 0).length;
    const losses = trades.filter((t) => t.profitLoss < 0).length;

    const sumWins = trades.filter((t) => t.profitLoss > 0).reduce((s, t) => s + t.profitLoss, 0);
    const sumLosses = trades.filter((t) => t.profitLoss < 0).reduce((s, t) => s + t.profitLoss, 0);

    const averageProfit = wins ? sumWins / wins : 0;
    const averageLoss = losses ? sumLosses / losses : 0; // negative value

    const winRate = total ? (wins / total) * 100 : 0;
    const profitFactor = Math.abs(sumLosses) > 0 ? sumWins / Math.abs(sumLosses) : sumWins > 0 ? Infinity : 0;

    const avgRR = averageLoss !== 0 ? averageProfit / Math.abs(averageLoss) : averageProfit > 0 ? Infinity : 0;

    const equity = trades.map((t) => t.profitLoss);
    const equityCurve = [] as number[];
    let cum = 0;
    for (const v of equity) {
      cum += v;
      equityCurve.push(Number(cum.toFixed(4)));
    }

    let peak = -Infinity;
    let maxDrawdown = 0;
    for (const val of equityCurve) {
      if (val > peak) peak = val;
      const dd = peak - val;
      if (dd > maxDrawdown) maxDrawdown = dd;
    }

    return {
      totalTrades: total,
      winRate: Number(winRate.toFixed(2)),
      profitFactor: isFinite(profitFactor) ? Number(profitFactor.toFixed(4)) : null,
      averageRR: isFinite(avgRR) ? Number(avgRR.toFixed(4)) : null,
      maxDrawdown: Number(maxDrawdown.toFixed(4)),
      averageProfit: Number(averageProfit.toFixed(4)),
      averageLoss: Number(averageLoss.toFixed(4)),
    };
  }

  // Monthly performance: [{ month: '2026-06', profit: number, trades, winRate }]
  async monthlyPerformance(from?: string, to?: string) {
    const trades = await this.fetchTrades(from, to);
    const buckets: Record<string, any> = {};
    for (const t of trades) {
      const d = new Date(t.createdAt);
      const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
      if (!buckets[key]) buckets[key] = { profit: 0, trades: 0, wins: 0 };
      buckets[key].profit += t.profitLoss;
      buckets[key].trades += 1;
      if (t.profitLoss > 0) buckets[key].wins += 1;
    }
    const rows = Object.keys(buckets)
      .sort()
      .map((k) => ({ month: k, profit: Number(buckets[k].profit.toFixed(4)), trades: buckets[k].trades, winRate: Number(((buckets[k].wins / buckets[k].trades) * 100).toFixed(2)) }));

    return rows;
  }

  async equityCurve(from?: string, to?: string) {
    const trades = await this.fetchTrades(from, to);
    const points: { date: string; equity: number }[] = [];
    let cum = 0;
    for (const t of trades) {
      cum += t.profitLoss;
      points.push({ date: new Date(t.createdAt).toISOString(), equity: Number(cum.toFixed(4)) });
    }
    return points;
  }

  async winRateTrend(from?: string, to?: string) {
    const monthly = await this.monthlyPerformance(from, to);
    return monthly.map((m) => ({ month: m.month, winRate: m.winRate }));
  }
}
