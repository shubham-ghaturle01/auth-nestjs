import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { TradeQueryDto } from './dto/query-trade.dto';

@Injectable()
export class TradesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTradeDto: CreateTradeDto) {
    return this.prisma.trade.create({ data: createTradeDto });
  }

  async findAll(query: TradeQueryDto) {
    const where: Prisma.TradeWhereInput = {};

    if (query.pair) {
      where.pair = { contains: query.pair, mode: 'insensitive' };
    }
    if (query.tradeType) {
      where.tradeType = { equals: query.tradeType, mode: 'insensitive' };
    }
    if (query.result) {
      where.result = { equals: query.result, mode: 'insensitive' };
    }
    if (query.emotion) {
      where.emotion = { contains: query.emotion, mode: 'insensitive' };
    }
    if (query.tag) {
      where.tags = { has: query.tag };
    }

    if (query.search) {
      where.OR = [
        { pair: { contains: query.search, mode: 'insensitive' } },
        { tradeType: { contains: query.search, mode: 'insensitive' } },
        { result: { contains: query.search, mode: 'insensitive' } },
        { emotion: { contains: query.search, mode: 'insensitive' } },
        { notes: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.trade.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.trade.findUnique({ where: { id } });
  }

  async update(id: string, updateTradeDto: UpdateTradeDto) {
    return this.prisma.trade.update({ where: { id }, data: updateTradeDto });
  }

  async remove(id: string) {
    return this.prisma.trade.delete({ where: { id } });
  }

  async uploadScreenshot(id: string, screenshotUrl: string) {
    return this.prisma.trade.update({
      where: { id },
      data: { screenshotUrl },
    });
  }
}
