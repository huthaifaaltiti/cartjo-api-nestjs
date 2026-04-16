import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiPaths } from 'src/common/constants/api-paths';
import { AppConfigService } from './appConfig.service';
import { UpdateConfigDto } from './dto/update-config.dto';

@Controller(ApiPaths.AppConfig.Root)
export class AppConfigController {
  constructor(private readonly appConfigService: AppConfigService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get(ApiPaths.AppConfig.GetAll)
  async getConfigs(@Request() req: any) {
    return this.appConfigService.getConfigs(req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put(ApiPaths.AppConfig.Update)
  async updateConfig(@Request() req: any, @Body() body: UpdateConfigDto) {
    return this.appConfigService.updateConfig(req.user, body);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(ApiPaths.AppConfig.Refresh)
  async refreshConfig(@Request() req: any) {
    return this.appConfigService.refreshConfigForUser(req.user);
  }
}
