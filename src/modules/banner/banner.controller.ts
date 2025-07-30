import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { BannerService } from './banner.service';
import { GetBannersQueryDto } from './dto/get-all.dto';

@Controller('/api/v1/banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('all')
  async getBanners(@Query() query: GetBannersQueryDto, @Request() req: any) {
    const { lang, limit, lastId, search, startDate, endDate } = query;
    const { user } = req;

    return this.bannerService.getAll(user, {
      lang,
      limit,
      lastId,
      search,
      startDate,
      endDate,
    });
  }
}
