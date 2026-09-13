import {
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateConfigDto } from './dto/update-config.dto';
import { AppConfig, AppConfigDocument } from '../../schemas/appConfig.schema';
import { checkRequiredPermissions } from '../../common/utils/permission-check.utils';
import { Permission } from '../../enums/permission.enum';
import { validationConfig } from '../../configs/validationConfig';

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

  private get defaults(): Record<string, number> {
    return {
      minActiveCategories: 2,
      minActiveBanners: 1,
      minActiveLogos: 1,
      handleChangeCooldownDays:
        validationConfig.creatorStore.handleChangeCooldownDays,
      defaultCreatorStoreCommissionRate:
        validationConfig.creatorStore.defaultCommissionRate,
    };
  }

  private async loadConfig(): Promise<void> {
    const raw = await this.appConfigModel.findOne().lean();

    if (!raw) {
      const created = await this.appConfigModel.create(this.defaults);
      this.configCache = created.toObject() as AppConfig;
      return;
    }

    const stored = raw as Record<string, unknown>;
    const missing: Record<string, number> = {};
    for (const [key, value] of Object.entries(this.defaults)) {
      if (stored[key] === undefined || stored[key] === null) {
        missing[key] = value;
      }
    }

    if (Object.keys(missing).length) {
      await this.appConfigModel.updateOne({ _id: raw._id }, { $set: missing });
      this.configCache = (await this.appConfigModel
        .findById(raw._id)
        .lean()) as AppConfig;
      return;
    }

    this.configCache = raw as AppConfig;
  }

  get config(): AppConfig {
    if (!this.configCache) {
      throw new InternalServerErrorException('App configuration not loaded');
    }
    return this.configCache;
  }

  async getConfigs(user: any) {
    checkRequiredPermissions(
      user?.permissions,
      [Permission.APP_CONFIG_READ],
      'en',
    );

    return {
      isSuccess: true,
      message: 'Config retrieved successfully',
      data: this.config,
    };
  }

  async updateConfig(user: any, dto: UpdateConfigDto) {
    checkRequiredPermissions(
      user?.permissions,
      [Permission.APP_CONFIG_UPDATE],
      'en',
    );

    await this.appConfigModel.updateOne({}, dto, { upsert: true });
    await this.loadConfig();

    return {
      isSuccess: true,
      message: 'Config updated successfully',
      data: this.config,
    };
  }

  async refreshConfigForUser(user: any) {
    checkRequiredPermissions(
      user?.permissions,
      [Permission.APP_CONFIG_UPDATE],
      'en',
    );

    await this.loadConfig();

    return {
      isSuccess: true,
      message: 'Config cache refreshed successfully',
      data: this.config,
    };
  }
}
