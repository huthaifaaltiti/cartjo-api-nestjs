import { Controller, Get, Param, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { BannerService } from './banner.service';
import { GetBannersQueryDto } from './dto/get-all.dto';
import { GetBannerParamDto, GetBannerQueryDto } from './dto/get-one.dto';

@Controller('/api/v1/banner')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('all')
  async getAll(@Query() query: GetBannersQueryDto, @Request() req: any) {
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

  @Get('active')
  async getActiveOne(@Query() query: GetBannerQueryDto) {
    const { lang } = query;

    return this.bannerService.getActiveOne(lang);
  }

  @Get('/:id')
  async getOne(
    @Param() param: GetBannerParamDto,
    @Query() query: GetBannerQueryDto,
  ) {
    const { id } = param;
    const { lang } = query;

    return this.bannerService.getOne(id, lang);
  }
}
