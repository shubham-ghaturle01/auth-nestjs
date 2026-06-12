import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TradesService } from './trades.service';
import { CreateTradeDto } from './dto/create-trade.dto';
import { UpdateTradeDto } from './dto/update-trade.dto';
import { TradeQueryDto } from './dto/query-trade.dto';
import { FileInterceptor } from '@nestjs/platform-express';
const { diskStorage } = require('multer');
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const UPLOAD_PATH = join(process.cwd(), 'uploads', 'trade-screenshots');
if (!existsSync(UPLOAD_PATH)) {
  mkdirSync(UPLOAD_PATH, { recursive: true });
}

@Controller('trades')
@ApiTags('trades')
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Post()
  @ApiOkResponse({ description: 'Create trade record' })
  create(@Body() createTradeDto: CreateTradeDto) {
    return this.tradesService.create(createTradeDto);
  }

  @Get()
  @ApiOkResponse({ description: 'List trades with optional filters and search' })
  findAll(@Query() query: TradeQueryDto) {
    return this.tradesService.findAll(query);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Update a trade' })
  update(@Param('id') id: string, @Body() updateTradeDto: UpdateTradeDto) {
    return this.tradesService.update(id, updateTradeDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Delete a trade' })
  remove(@Param('id') id: string) {
    return this.tradesService.remove(id);
  }

  @Post(':id/screenshot')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_PATH,
        filename: (_req: any, file: any, callback: any) => {
          const fileName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
          const extension = extname(file.originalname);
          callback(null, `${fileName}${extension}`);
        },
      }),
    }),
  )
  uploadScreenshot(
    @Param('id') id: string,
    @UploadedFile(new ParseFilePipe({ fileIsRequired: true })) file: any,
  ) {
    const screenshotUrl = `/uploads/trade-screenshots/${file.filename}`;
    return this.tradesService.uploadScreenshot(id, screenshotUrl);
  }
}
