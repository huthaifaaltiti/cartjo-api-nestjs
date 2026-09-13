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
import { AppConfigService } from './appConfig.service';
import { UpdateConfigDto } from './dto/update-config.dto';
import { ApiPaths } from '../../common/constants/api-paths';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permission } from '../../enums/permission.enum';

const JWT = AuthGuard('jwt');

@Controller(ApiPaths.AppConfig.Root)
export class AppConfigController {
  constructor(private readonly appConfigService: AppConfigService) {}

  @RequirePermissions(Permission.APP_CONFIG_READ)
  @UseGuards(JWT, PermissionsGuard)
  @Get(ApiPaths.AppConfig.GetAll)
  async getConfigs(@Request() req: any) {
    return this.appConfigService.getConfigs(req.user);
  }

  @RequirePermissions(Permission.APP_CONFIG_UPDATE)
  @UseGuards(JWT, PermissionsGuard)
  @Put(ApiPaths.AppConfig.Update)
  async updateConfig(@Request() req: any, @Body() body: UpdateConfigDto) {
    return this.appConfigService.updateConfig(req.user, body);
  }

  @RequirePermissions(Permission.APP_CONFIG_UPDATE)
  @UseGuards(JWT, PermissionsGuard)
  @Post(ApiPaths.AppConfig.Refresh)
  async refreshConfig(@Request() req: any) {
    return this.appConfigService.refreshConfigForUser(req.user);
  }
}
