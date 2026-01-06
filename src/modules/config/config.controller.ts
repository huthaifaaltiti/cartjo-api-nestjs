import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiPaths } from 'src/common/constants/api-paths';
import { ConfigsService } from './config.service';
import { GetConfigDto } from './dto/get-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';

@Controller(ApiPaths.Configs.Root)
export class ConfigsController {
  constructor(private readonly configsService: ConfigsService) {}

  @Get(ApiPaths.Configs.GetOne)
  async getConfig(@Param() params: GetConfigDto) {
    return this.configsService.getConfig(params);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(ApiPaths.Configs.Update)
  async updateConfig(
    @Param() params: GetConfigDto,
    @Body() dto: UpdateConfigDto,
  ) {
    return this.configsService.updateConfig(params, dto);
  }
}
