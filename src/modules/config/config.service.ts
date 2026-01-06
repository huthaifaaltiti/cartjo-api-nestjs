import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppConfig, AppConfigDocument } from 'src/schemas/config.schema';
import { DataResponse } from 'src/types/service-response.type';
import { GetConfigDto } from './dto/get-config.dto';
import { UpdateConfigDto } from './dto/update-config.dto';
import { getMessage } from 'src/common/utils/translator';

@Injectable()
export class ConfigsService {
  private cache = new Map<string, any>();

  constructor(
    @InjectModel(AppConfig.name)
    private readonly configModel: Model<AppConfigDocument>,
  ) {}

  async getConfig(
    params: GetConfigDto,
  ): Promise<DataResponse<any>> {
    const { key, lang } = params;

    if (this.cache.has(key)) {
      return {
        isSuccess: true,
        message: getMessage('appConfigs_configRetrieved', lang),
        data: this.cache.get(key),
      };
    }

    const config = await this.configModel.findOne({ key }).lean();

    if (!config)
      throw new NotFoundException(`Config "${key}" not found`);

    this.cache.set(key, config.value);

    return {
      isSuccess: true,
      message: getMessage('appConfigs_configRetrieved', lang),
      data: config.value,
    };
  }

  async updateConfig(
    params: GetConfigDto,
    dto: UpdateConfigDto,
  ): Promise<DataResponse<any>> {
    const { key, lang } = params;
    const { value } = dto;

    const updated = await this.configModel.findOneAndUpdate(
      { key },
      {
        value,
        $inc: { version: 1 },
      },
      { new: true, upsert: true },
    );

    this.cache.set(key, updated.value);

    return {
      isSuccess: true,
      message: getMessage('appConfigs_configUpdated', lang),
      data: updated.value,
    };
  }
}
