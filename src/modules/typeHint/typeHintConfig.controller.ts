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

import { TypeHintConfigService } from './typeHintConfig.service';

import { CreateDto } from './dto/create.dto';
import { GetAllQueryDto } from './dto/get-all.dto';
import { GetOneParamDto, GetOneQueryDto } from './dto/get-one.dto';
import { GetActiveOnesQueryDto } from './dto/get-active-ones.dto';
import { UpdateDto, UpdateParamsDto } from './dto/update.dto';
import { DeleteDto, DeleteParamsDto } from './dto/delete.dto';
import { UnDeleteDto, UnDeleteParamsDto } from './dto/unDelete.dto';
import {
  UpdateStatusBodyDto,
  UpdateStatusParamsDto,
} from './dto/update-active-status.dto';
import { GetListQueryDto } from './dto/get-list.dto';

@Controller('/api/v1/type-hint-config')
export class TypeHintConfigController {
  constructor(private readonly typeHintConfigService: TypeHintConfigService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('all')
  async getAll(@Query() query: GetAllQueryDto, @Request() req: any) {
    return this.typeHintConfigService.getAll(req?.user, query);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('list')
  async getList(@Query() query: GetListQueryDto, @Request() req: any) {
    return this.typeHintConfigService.getList(req?.user, query);
  }

  @Get('active')
  async getActiveOnes(@Query() query: GetActiveOnesQueryDto) {
    const { lang } = query;

    return this.typeHintConfigService.getActiveOnes(lang);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/:id')
  async getOne(@Param() param: GetOneParamDto, @Query() query: GetOneQueryDto) {
    return this.typeHintConfigService.getOne(param?.id, query?.lang);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('create')
  async create(@Request() req: any, @Body() dto: CreateDto) {
    return this.typeHintConfigService.create(req?.user, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('update/:id')
  async update(
    @Request() req: any,
    @Body() body: UpdateDto,
    @Param() param: UpdateParamsDto,
  ) {
    return this.typeHintConfigService.update(req?.user, body, param?.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('delete/:id')
  async delete(
    @Request() req: any,
    @Body() dto: DeleteDto,
    @Param() param: DeleteParamsDto,
  ) {
    return this.typeHintConfigService.delete(req?.user, dto, param?.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('un-delete/:id')
  async unDelete(
    @Request() req: any,
    @Body() dto: UnDeleteDto,
    @Param() param: UnDeleteParamsDto,
  ) {
    return this.typeHintConfigService.unDelete(req?.user, dto, param?.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('status/:id')
  async updateStatus(
    @Param() param: UpdateStatusParamsDto,
    @Body() dto: UpdateStatusBodyDto,
    @Request() req: any,
  ) {
    return this.typeHintConfigService.updateStatus(param.id, dto, req.user);
  }
}
