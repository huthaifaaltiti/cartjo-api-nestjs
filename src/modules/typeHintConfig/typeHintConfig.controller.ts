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
import { ApiPaths } from 'src/common/constants/api-paths';
@Controller(ApiPaths.TypeHintConfig.Root)
export class TypeHintConfigController {
  constructor(private readonly typeHintConfigService: TypeHintConfigService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(ApiPaths.TypeHintConfig.GetAll)
  async getAll(@Query() query: GetAllQueryDto, @Request() req: any) {
    return this.typeHintConfigService.getAll(req?.user, query);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(ApiPaths.TypeHintConfig.GetList)
  async getList(@Query() query: GetListQueryDto, @Request() req: any) {
    return this.typeHintConfigService.getList(req?.user, query);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(ApiPaths.TypeHintConfig.GetActiveOnes)
  async getActiveOnes(
    @Query() query: GetActiveOnesQueryDto,
    @Request() req: any,
  ) {
    const { lang } = query;

    return this.typeHintConfigService.getActiveOnes(req?.user, lang);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(ApiPaths.TypeHintConfig.GetOne)
  async getOne(@Param() param: GetOneParamDto, @Query() query: GetOneQueryDto) {
    return this.typeHintConfigService.getOne(param?.id, query?.lang);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(ApiPaths.TypeHintConfig.Create)
  async create(@Request() req: any, @Body() dto: CreateDto) {
    return this.typeHintConfigService.create(req?.user, dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(ApiPaths.TypeHintConfig.Update)
  async update(
    @Request() req: any,
    @Body() body: UpdateDto,
    @Param() param: UpdateParamsDto,
  ) {
    return this.typeHintConfigService.update(req?.user, body, param?.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(ApiPaths.TypeHintConfig.Delete)
  async delete(
    @Request() req: any,
    @Body() dto: DeleteDto,
    @Param() param: DeleteParamsDto,
  ) {
    return this.typeHintConfigService.delete(req?.user, dto, param?.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(ApiPaths.TypeHintConfig.UnDelete)
  async unDelete(
    @Request() req: any,
    @Body() dto: UnDeleteDto,
    @Param() param: UnDeleteParamsDto,
  ) {
    return this.typeHintConfigService.unDelete(req?.user, dto, param?.id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(ApiPaths.TypeHintConfig.UpdateStatus)
  async updateStatus(
    @Param() param: UpdateStatusParamsDto,
    @Body() dto: UpdateStatusBodyDto,
    @Request() req: any,
  ) {
    return this.typeHintConfigService.updateStatus(param.id, dto, req.user);
  }
}
