import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UseGuards,
  Request,
  Put,
  Param,
  Delete,
  Get,
  Query,
  UploadedFiles,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
} from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { LogoService } from './logo.service';
import { CreateLogoDto } from './dto/create-logo.dto';
import { UpdateLogoDto, UpdateLogoParamsDto } from './dto/update-logo.dto';
import { DeleteLogoDto, DeleteLogoParamsDto } from './dto/delete-logo.dto';
import {
  UnDeleteLogoBodyDto,
  UnDeleteLogoParamsDto,
} from './dto/unDelete-logo.dto';
import {
  UpdateLogoStatusBodyDto,
  UpdateLogoStatusParamsDto,
} from './dto/update-logo-status.dto';
import { GetLogoParamDto, GetLogoQueryDto } from './dto/get-logo.dto';
import { GetLogosQueryDto } from './dto/get-logos-query.dto';
import { ApiPaths } from '../../common/constants/api-paths';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Permission } from '../../enums/permission.enum';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { LogoType } from '../../enums/logoType.enum';

@Controller(ApiPaths.Logo.Root)
export class LogoController {
  constructor(private readonly logoService: LogoService) { }

  @RequirePermissions(Permission.LOGOS_READ)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get(ApiPaths.Logo.GetAll)
  async getLogos(@Query() query: GetLogosQueryDto, @Request() req: any) {
    const { lang, limit, lastId, search } = query;
    const { user } = req;

    return this.logoService.getAll(user, {
      lang,
      limit,
      lastId,
      search,
    });
  }

  @Get(ApiPaths.Logo.GetActiveOnes)
  async getActiveLogo(@Query() query: GetLogoQueryDto) {
    const { lang, type } = query;

    return this.logoService.getActiveLogo(lang, type ?? LogoType.MAIN);
  }

  @RequirePermissions(Permission.LOGOS_READ)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Get(ApiPaths.Logo.GetOne)
  async getLogo(
    @Request() req: any,
    @Param() param: GetLogoParamDto,
    @Query() query: GetLogoQueryDto,
  ) {
    const { id } = param;
    const { lang } = query;
    const { user } = req;

    return this.logoService.getOne(user, id, lang);
  }

  @RequirePermissions(Permission.LOGOS_CREATE)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Post(ApiPaths.Logo.Create)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image_ar', maxCount: 1 },
      { name: 'image_en', maxCount: 1 },
    ]),
  )
  async createLogo(
    @UploadedFiles()
    files: {
      image_ar?: Express.Multer.File[];
      image_en?: Express.Multer.File[];
    },
    @Request() req: any,
    @Body() body: CreateLogoDto,
  ) {
    const image_ar = files.image_ar?.[0];
    const image_en = files.image_en?.[0];

    return this.logoService.create(req, body, image_ar, image_en);
  }

  @RequirePermissions(Permission.LOGOS_UPDATE)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Put(ApiPaths.Logo.Update)
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
    @Body() body: UpdateLogoDto,
    @Param() param: UpdateLogoParamsDto,
  ) {
    const { id } = param;
    const image_ar = files?.image_ar?.[0];
    const image_en = files?.image_en?.[0];

    return this.logoService.update(req, body, id, image_ar, image_en);
  }

  @RequirePermissions(Permission.LOGOS_DELETE)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Delete(ApiPaths.Logo.Delete)
  async delete(
    @Request() req: any,
    @Body() body: DeleteLogoDto,
    @Param() param: DeleteLogoParamsDto,
  ) {
    const { user } = req;
    const { id } = param;

    return this.logoService.delete(user, body, id);
  }

  @RequirePermissions(Permission.LOGOS_RESTORE)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Delete(ApiPaths.Logo.UnDelete)
  async unDeleteLogo(
    @Request() req: any,
    @Param() param: UnDeleteLogoParamsDto,
    @Body() body: UnDeleteLogoBodyDto,
  ) {
    const { user } = req;
    const { id } = param;

    return this.logoService.unDelete(user, body, id);
  }

  @RequirePermissions(Permission.LOGOS_ACTIVATE, Permission.LOGOS_DEACTIVATE)
  @UseGuards(AuthGuard('jwt'), PermissionsGuard)
  @Put(ApiPaths.Logo.UpdateStatus)
  async updateLogoStatus(
    @Param() param: UpdateLogoStatusParamsDto,
    @Body() body: UpdateLogoStatusBodyDto,
    @Request() req: any,
  ) {
    const { lang, isActive } = body;
    const { user } = req;
    const { id } = param;

    return this.logoService.updateStatus(id, isActive, lang, user);
  }
}
