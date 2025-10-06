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
import {
  UpdateStatusBodyDto,
  UpdateStatusParamsDto,
} from './dto/update-active-status.dto';
import { OptionalJwtAuthGuard } from 'src/common/utils/optionalJwtAuthGuard';
import { ApiPaths } from 'src/common/constants/api-paths';

@Controller(ApiPaths.Showcase.Root)
export class ShowcaseController {
  constructor(private readonly showcaseService: ShowcaseService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(ApiPaths.Showcase.GetAll)
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

  @UseGuards(OptionalJwtAuthGuard)
  @Get(ApiPaths.Showcase.GetActiveOnes)
  async getActiveOnes(
    @Query() query: GetActiveOnesQueryDto,
    @Request() req: any,
  ) {
    const { lang, limit } = query;
    const userId = req.user?.userId;

    return this.showcaseService.getActiveOnes(lang, limit, userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(ApiPaths.Showcase.GetOne)
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
  @Post(ApiPaths.Showcase.Create)
  async create(@Body() dto: CreateDto, @Request() req: any) {
    const { user } = req;

    return this.showcaseService.create(user, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(ApiPaths.Showcase.Update)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDto,
    @Request() req: any,
  ) {
    const { user } = req;

    return this.showcaseService.update(user, id, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(ApiPaths.Showcase.Delete)
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
  @Delete(ApiPaths.Showcase.UnDelete)
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
  @Put(ApiPaths.Showcase.UpdateStatus)
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
