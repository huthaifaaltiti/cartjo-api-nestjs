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
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { ShowcaseService } from './showcase.service';

import { GetQueryDto } from './dto/get-all.dto';
import { GetParamDto } from './dto/get-one.dto';
import { CreateDto } from './dto/create.dto';
import { UpdateDto } from './dto/update.dto';
import { DeleteDto, DeleteParamsDto } from './dto/delete.dto';
import { GetActiveOnesQueryDto } from './dto/get-active-ones.dto';
import { UnDeleteDto, UnDeleteParamsDto } from './dto/unDelete.dto';
import { UpdateStatusBodyDto, UpdateStatusParamsDto } from './dto/update-active-status.dto';

@Controller('/api/v1/showcase')
export class ShowcaseController {
  constructor(private readonly showcaseService: ShowcaseService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('all')
  async getAll(@Query() query: GetQueryDto, @Request() req: any) {
    const { lang, limit, lastId, search, startDate, endDate } = query;
    const { user } = req;

    return this.showcaseService.getAll(user, {
      lang,
      limit,
      lastId,
      search,
      startDate,
      endDate,
    });
  }

  @Get('active')
  async getActiveOnes(@Query() query: GetActiveOnesQueryDto) {
    const { lang, limit } = query;

    return this.showcaseService.getActiveOnes(lang, limit);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/:id')
  async getOne(
    @Param() param: GetParamDto,
    @Query() query: GetQueryDto,
    @Request() req: any,
  ) {
    const { id } = param;
    const { lang } = query;
    const { user } = req;

    return this.showcaseService.getOne(user, id, lang);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  async create(@Body() dto: CreateDto, @Request() req: any) {
    const { user } = req;

    return this.showcaseService.create(user, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('update/:id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDto,
    @Request() req: any,
  ) {
    const { user } = req;

    return this.showcaseService.update(user, id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('delete/:id')
  async delete(
    @Request() req: any,
    @Body() body: DeleteDto,
    @Param() param: DeleteParamsDto,
  ) {
    const { user } = req;
    const { id } = param;

    return this.showcaseService.delete(user, body, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('un-delete/:id')
  async unDelete(
    @Request() req: any,
    @Param() param: UnDeleteParamsDto,
    @Body() body: UnDeleteDto,
  ) {
    const { user } = req;
    const { id } = param;

    return this.showcaseService.unDelete(user, body, id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('status/:id')
  async updateStatus(
    @Param() param: UpdateStatusParamsDto,
    @Body() body: UpdateStatusBodyDto,
    @Request() req: any,
  ) {
    const { lang, isActive } = body;
    const { user } = req;
    const { id } = param;

    return this.showcaseService.updateStatus(id, isActive, lang, user);
  }
}
