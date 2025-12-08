import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { BannerService } from './banner.service';
import { GetBannersQueryDto } from './dto/get-all.dto';
import { GetBannerParamDto, GetBannerQueryDto } from './dto/get-one.dto';
import { CreateBannerDto } from './dto/create.dto';
import { UpdateBannerDto, UpdateBannerParamsDto } from './dto/update.dto';
import { DeleteDto, DeleteParamsDto } from './dto/delete.dto';
import { UnDeleteDto, UnDeleteParamsDto } from './dto/unDelete.dto';
import {
  UpdateStatusBodyDto,
  UpdateStatusParamsDto,
} from './dto/update-active-status.dto';
import { ApiPaths } from 'src/common/constants/api-paths';

@Controller(ApiPaths.Banner.Root)
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(ApiPaths.Banner.GetAll)
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

  @Get(ApiPaths.Banner.GetActiveOnes)
  async getActiveOnes(@Query() query: GetBannerQueryDto) {
    const { lang } = query;

    return this.bannerService.getActiveOnes(lang);
  }

  @Get(ApiPaths.Banner.GetOne)
  async getOne(
    @Param() param: GetBannerParamDto,
    @Query() query: GetBannerQueryDto,
  ) {
    const { id } = param;
    const { lang } = query;

    return this.bannerService.getOne(id, lang);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(ApiPaths.Banner.Create)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image_ar', maxCount: 1 },
      { name: 'image_en', maxCount: 1 },
    ]),
  )
  async create(
    @UploadedFiles()
    files: {
      image_ar?: Express.Multer.File[];
      image_en?: Express.Multer.File[];
    },
    @Request() req: any,
    @Body() body: CreateBannerDto,
  ) {
    const image_ar = files.image_ar?.[0];
    const image_en = files.image_en?.[0];

    return this.bannerService.create(req.user, body, image_ar, image_en);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(ApiPaths.Banner.Update)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image_ar', maxCount: 1 },
      { name: 'image_en', maxCount: 1 },
    ]),
  )
  async update(
    @UploadedFiles()
    files: {
      image_ar?: Express.Multer.File[];
      image_en?: Express.Multer.File[];
    },
    @Request() req: any,
    @Body() body: UpdateBannerDto,
    @Param() param: UpdateBannerParamsDto,
  ) {
    const image_ar = files.image_ar?.[0];
    const image_en = files.image_en?.[0];

    return this.bannerService.update(
      req.user,
      body,
      param.id,
      image_ar,
      image_en,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(ApiPaths.Banner.Delete)
  async delete(
    @Request() req: any,
    @Body() body: DeleteDto,
    @Param() param: DeleteParamsDto,
  ) {
    const { user } = req;
    const { id } = param;

    return this.bannerService.delete(user, body, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(ApiPaths.Banner.UnDelete)
  async unDelete(
    @Request() req: any,
    @Param() param: UnDeleteParamsDto,
    @Body() body: UnDeleteDto,
  ) {
    const { user } = req;
    const { id } = param;

    return this.bannerService.unDelete(user, body, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(ApiPaths.Banner.UpdateStatus)
  async updateStatus(
    @Param() param: UpdateStatusParamsDto,
    @Body() body: UpdateStatusBodyDto,
    @Request() req: any,
  ) {
    const { lang, isActive } = body;
    const { user } = req;
    const { id } = param;

    return this.bannerService.updateStatus(id, isActive, lang, user);
  }
}
