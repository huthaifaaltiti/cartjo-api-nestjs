import {
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppConfig, AppConfigDocument } from 'src/schemas/appConfig.schema';
import { UpdateConfigDto } from './dto/update-config.dto';
import { validateUserRoleAccess } from 'src/common/utils/validateUserRoleAccess';

@Injectable()
export class AppConfigService implements OnModuleInit {
  private configCache: AppConfig | null = null;

  constructor(
    @InjectModel(AppConfig.name)
    private readonly appConfigModel: Model<AppConfigDocument>,
  ) {}

  async onModuleInit() {
    await this.loadConfig();
  }

  private async loadConfig(): Promise<void> {
    let config = await this.appConfigModel.findOne().lean();

    if (!config) {
      config = await this.appConfigModel.create({
        minActiveCategories: 2,
        minActiveBanners: 1,
        minActiveLogos: 1,
      });
    }

    this.configCache = config as AppConfig;
  }

  get config(): AppConfig {
    if (!this.configCache) {
      throw new InternalServerErrorException('App configuration not loaded');
    }
    return this.configCache;
  }

  async getConfigs(user: any) {
    validateUserRoleAccess(user, 'en');

    return {
      isSuccess: true,
      message: 'Config retrieved successfully',
      data: this.config,
    };
  }

  async updateConfig(user: any, dto: UpdateConfigDto) {
    validateUserRoleAccess(user, 'en');

    await this.appConfigModel.updateOne({}, dto, { upsert: true });
    await this.loadConfig();

    return {
      isSuccess: true,
      message: 'Config updated successfully',
      data: this.config,
    };
  }

  async refreshConfigForUser(user: any) {
    validateUserRoleAccess(user, 'en');

    await this.loadConfig();

    return {
      isSuccess: true,
      message: 'Config cache refreshed successfully',
      data: this.config,
    };
  }
}
