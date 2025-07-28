import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Request,
  Put,
  Param,
  Delete,
  Get,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

@Controller('/api/v1/logo')
export class LogoController {
  constructor(private readonly logoService: LogoService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('all')
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

  @Get('active')
  async getActiveLogo(@Query() query: GetLogoQueryDto) {
    const { lang } = query;
    return this.logoService.getActiveLogo(lang);
  }

  @Get('/:id')
  async getLogo(
    @Param() param: GetLogoParamDto,
    @Query() query: GetLogoQueryDto,
  ) {
    const { id } = param;
    const { lang } = query;

    return this.logoService.getOne(id, lang);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  @UseInterceptors(FileInterceptor('image'))
  async createLogo(
    @UploadedFile() image: Express.Multer.File,
    @Request() req: any,
    @Body() body: CreateLogoDto,
  ) {
    const { user } = req;

    return this.logoService.create(user, body, image);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('update/:id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @UploadedFile() image: Express.Multer.File,
    @Request() req: any,
    @Body() body: UpdateLogoDto,
    @Param() param: UpdateLogoParamsDto,
  ) {
    const { user } = req;
    const { id } = param;

    return this.logoService.update(user, body, image, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('delete/:id')
  async delete(
    @Request() req: any,
    @Body() body: DeleteLogoDto,
    @Param() param: DeleteLogoParamsDto,
  ) {
    const { user } = req;
    const { id } = param;

    return this.logoService.delete(user, body, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('un-delete/:id')
  async unDeletelogo(
    @Request() req: any,
    @Param() param: UnDeleteLogoParamsDto,
    @Body() body: UnDeleteLogoBodyDto,
  ) {
    const { user } = req;
    const { id } = param;

    return this.logoService.unDelete(user, body, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('status/:id')
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
