import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';

import { validateUserRoleAccess } from 'src/common/utils/validateUserRoleAccess';

import { CreateDto } from './dto/create.dto';
import {
  TypeHintConfig,
  TypeHintConfigDocument,
} from 'src/schemas/typeHintConfig.schema';
import { getMessage } from 'src/common/utils/translator';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { Locale } from 'src/types/Locale';

import {
  BaseResponse,
  DataListResponse,
  DataResponse,
} from 'src/types/service-response.type';
import { deactivateExpiredDocs } from 'src/common/functions/helpers/deactivateExpiredDocs';

import { GetAllQueryDto } from './dto/get-all.dto';
import { UpdateDto } from './dto/update.dto';
import { DeleteDto } from './dto/delete.dto';
import { UpdateStatusBodyDto } from './dto/update-active-status.dto';
import { UnDeleteDto } from './dto/unDelete.dto';

export class TypeHintConfigService {
  private readonly staticTypeHintConfigs: string[] = [
    'static',
    'best_sellers',
    'most_viewed',
    'editor_pick',
    'recommended_for_you',
  ];

  constructor(
    @InjectModel(TypeHintConfig.name)
    private typeHintConfigModel: Model<TypeHintConfigDocument>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async deactivateExpiredTypeHintConfigs() {
    await deactivateExpiredDocs(this.typeHintConfigModel);
  }

  async getAll(
    reqUser: any,
    queryData: GetAllQueryDto,
  ): Promise<DataListResponse<TypeHintConfig>> {
    const {
      lang = 'en',
      limit = 10,
      lastId,
      search,
      startDate,
      endDate,
    } = queryData;

    validateUserRoleAccess(reqUser, lang);

    const query: any = {};

    // Pagination
    if (lastId) {
      query._id = { $lt: new Types.ObjectId(lastId) };
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { [`key.${lang}`]: searchRegex },
        { [`label.${lang}`]: searchRegex },
      ];
    }

    // Date filtering
    if (startDate || endDate) {
      query.$and = [];

      if (startDate) {
        query.$and.push({ startDate: { $gte: new Date(startDate) } });
      }
      if (endDate) {
        query.$and.push({ endDate: { $lte: new Date(endDate) } });
      }
    }

    const typeHintConfigs = await this.typeHintConfigModel
      .find(query)
      .sort({ _id: -1 })
      .limit(Number(limit))
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('createdBy', 'firstName lastName email _id')
      .populate('updatedBy', 'firstName lastName email _id')
      .select('-__v')
      .lean();

    return {
      isSuccess: true,
      message: getMessage(
        'typeHintConfig_typeHintConfigsRetrievedSuccessfully',
        lang,
      ),
      dataCount: typeHintConfigs.length,
      data: typeHintConfigs,
    };
  }

  async getActiveOnes(
    lang?: Locale,
  ): Promise<DataListResponse<TypeHintConfigDocument>> {
    const now = new Date();

    const findQuery = {
      isActive: true,
      isDeleted: false,
      $or: [
        { startDate: { $lte: now }, endDate: { $gte: now } }, // Banner started before or at the current moment  startDate <= now, banner ends after or at the current moment endDate >= now
        { startDate: { $lte: now }, endDate: null }, // Banner already started (startDate <= now) but it has no end date
        { startDate: null, endDate: null }, //No start date and no end date were set,his means the banner is considered always active, as there are no time restrictions at all.
      ],
    };

    const typeHintConfigs = await this.typeHintConfigModel
      .find(findQuery)
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('unDeletedBy', 'firstName lastName email _id')
      .populate('createdBy', 'firstName lastName email _id')
      .lean();

    if (typeHintConfigs.length === 0) {
      throw new NotFoundException(
        getMessage('typeHintConfig_noActiveTypeHintConfigsFound', lang),
      );
    }

    return {
      isSuccess: true,
      message: getMessage(
        'typeHintConfig_activeTypeHintConfigsRetrievedSuccessfully',
        lang,
      ),
      dataCount: typeHintConfigs.length,
      data: typeHintConfigs,
    };
  }

  async getOne(
    id: string,
    lang?: Locale,
  ): Promise<DataResponse<TypeHintConfig>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(
        getMessage('typeHintConfig_invalidBannerId', lang),
      );
    }

    const typeHintConfig = await this.typeHintConfigModel
      .findById(id)
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('unDeletedBy', 'firstName lastName email _id')
      .populate('createdBy', 'firstName lastName email _id')
      .lean();

    if (!typeHintConfig) {
      throw new NotFoundException(
        getMessage('typeHintConfig_typeHintConfigNotFound', lang),
      );
    }

    return {
      isSuccess: true,
      message: getMessage(
        'typeHintConfig_typeHintConfigRetrievedSuccessfully',
        lang,
      ),
      data: typeHintConfig,
    };
  }

  async create(
    reqUser: any,
    dto: CreateDto,
  ): Promise<DataResponse<TypeHintConfig>> {
    const {
      key,
      label_ar,
      label_en,
      colorFrom,
      colorTo,
      textColor,
      priority,
      icon,
      startDate,
      endDate,
      lang,
    } = dto;

    validateUserRoleAccess(reqUser, lang);

    if (endDate && new Date(endDate) < new Date(startDate)) {
      throw new BadRequestException(
        getMessage('typeHintConfig_endDateMustBeAfterStartDate', lang),
      );
    }

    const existing = await this.typeHintConfigModel.findOne({
      $or: [{ key }, { 'label.ar': label_ar }, { 'label.en': label_en }],
    });

    if (existing) {
      throw new BadRequestException(
        getMessage(
          'typeHintConfig_typeHintConfigWithThisDetailsAlreadyExist',
          lang,
        ),
      );
    }

    const typeHintData = {
      key,
      label: { ar: label_ar, en: label_en },
      colorFrom,
      colorTo,
      textColor,
      priority,
      icon,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      isActive: true,
      isDeleted: false,
      createdBy: reqUser?._id || null,
    };

    const typeHint = await this.typeHintConfigModel.create(typeHintData);

    return {
      isSuccess: true,
      message: getMessage(
        'typeHintConfig_typeHintConfigCreatedSuccessfully',
        lang,
      ),
      data: typeHint.toObject(),
    };
  }

  async update(
    reqUser: any,
    dto: UpdateDto,
    id: mongoose.Types.ObjectId,
  ): Promise<DataResponse<TypeHintConfig>> {
    validateUserRoleAccess(reqUser, dto.lang);

    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(
        getMessage('typeHintConfig_invalidBannerId', dto.lang),
      );
    }

    const typeHintConfig = await this.typeHintConfigModel.findById(id);

    if (!typeHintConfig || typeHintConfig.isDeleted) {
      throw new NotFoundException(
        getMessage('typeHintConfig_typeHintConfigNotFound', dto.lang),
      );
    }

    // Check for conflicts on title if updated
    if (
      (dto.key && dto.label_ar !== typeHintConfig.label.ar) ||
      (dto.label_en && dto.label_en !== typeHintConfig.label.en)
    ) {
      const conflict = await this.typeHintConfigModel.findOne({
        _id: { $ne: id },
        $or: [{ 'label.ar': dto.label_ar }, { 'label.en': dto.label_en }],
        isDeleted: false,
      });

      if (conflict) {
        throw new BadRequestException(
          getMessage(
            'typeHintConfig_typeHintConfigWithThisDetailsAlreadyExist',
            dto.lang,
          ),
        );
      }
    }

    if (dto.label_ar || dto.label_en) {
      typeHintConfig.label = {
        ar: dto.label_ar || typeHintConfig.label.ar,
        en: dto.label_en || typeHintConfig.label.en,
      };
    }

    if (dto.key) {
      typeHintConfig.key = dto?.key || typeHintConfig?.key;
    }

    if (dto.icon) {
      typeHintConfig.icon = dto.icon || typeHintConfig.icon;
    }

    if (dto.colorFrom) {
      typeHintConfig.colorFrom = dto.colorFrom || typeHintConfig.colorFrom;
    }

    if (dto.colorTo) {
      typeHintConfig.colorTo = dto.colorTo || typeHintConfig.colorTo;
    }

    if (dto.textColor) {
      typeHintConfig.textColor = dto.textColor || typeHintConfig.textColor;
    }

    if (dto.priority) {
      typeHintConfig.priority = dto.priority || typeHintConfig.priority;
    }

    if (dto.startDate) {
      typeHintConfig.startDate = new Date(dto.startDate);
    }

    if (dto.endDate) {
      typeHintConfig.endDate = new Date(dto.endDate);
    }

    typeHintConfig.updatedAt = new Date();
    typeHintConfig.updatedBy = reqUser?.userId;

    await typeHintConfig.save();

    return {
      isSuccess: true,
      message: getMessage(
        'typeHintConfig_typeHintConfigUpdatedSuccessfully',
        dto.lang,
      ),
      data: typeHintConfig.toObject(),
    };
  }

  async delete(
    requestingUser: any,
    dto: DeleteDto,
    id: mongoose.Types.ObjectId,
  ): Promise<BaseResponse> {
    validateUserRoleAccess(requestingUser, dto.lang);

    const typeHintConfig = await this.typeHintConfigModel.findById(id);

    if (!typeHintConfig) {
      throw new NotFoundException(
        getMessage('typeHintConfig_typeHintConfigNotFound', dto.lang),
      );
    }

    if (this.staticTypeHintConfigs.includes(typeHintConfig.key)) {
      throw new ForbiddenException(
        getMessage(
          'typeHintConfig_cannotDeleteDefaultTypeHintConfig',
          dto.lang,
        ),
      );
    }

    typeHintConfig.isDeleted = true;
    typeHintConfig.isActive = false;
    typeHintConfig.deletedAt = new Date();
    typeHintConfig.deletedBy = requestingUser.userId;
    typeHintConfig.unDeletedBy = null;

    await typeHintConfig.save();

    return {
      isSuccess: true,
      message: getMessage(
        'typeHintConfig_typeHintConfigDeletedSuccessfully',
        dto.lang,
      ),
    };
  }

  async unDelete(
    requestingUser: any,
    body: UnDeleteDto,
    id: mongoose.Types.ObjectId,
  ): Promise<BaseResponse> {
    const { lang } = body;

    validateUserRoleAccess(requestingUser, lang);

    const typeHintConfig = await this.typeHintConfigModel.findById(id);

    if (!typeHintConfig) {
      throw new NotFoundException(
        getMessage('typeHintConfig_typeHintConfigNotFound', lang),
      );
    }

    if (this.staticTypeHintConfigs.includes(typeHintConfig.key)) {
      throw new ForbiddenException(
        getMessage('typeHintConfig_cannotUnDeleteDefaultTypeHintConfig', lang),
      );
    }

    typeHintConfig.isDeleted = false;
    typeHintConfig.deletedAt = null;
    typeHintConfig.deletedBy = null;
    typeHintConfig.unDeletedBy = requestingUser.userId;
    typeHintConfig.unDeletedAt = new Date();

    await typeHintConfig.save();

    return {
      isSuccess: true,
      message: getMessage(
        'typeHintConfig_typeHintConfigUnDeletedSuccessfully',
        lang,
      ),
    };
  }

  async updateStatus(
    id: mongoose.Types.ObjectId,
    dto: UpdateStatusBodyDto,
    requestingUser: any,
  ): Promise<BaseResponse> {
    validateUserRoleAccess(requestingUser, dto.lang);

    const typeHintConfig = await this.typeHintConfigModel.findById(id);

    if (!typeHintConfig) {
      throw new NotFoundException(
        getMessage('typeHintConfig_typeHintConfigNotFound', dto.lang),
      );
    }

    const now = new Date();

    if (this.staticTypeHintConfigs.includes(typeHintConfig.key)) {
      throw new ForbiddenException(
        getMessage(
          'typeHintConfig_cannotChangeStatusDefaultTypeHintConfig',
          dto.lang,
        ),
      );
    }

    if (dto.isActive) {
      if (typeHintConfig.endDate && typeHintConfig.endDate < now) {
        throw new BadRequestException(
          getMessage('typeHintConfig_cannotActivateExpired', dto.lang),
        );
      }

      // Optional: Prevent activation if start date is in the future
      if (typeHintConfig.startDate && typeHintConfig.startDate > now) {
        throw new BadRequestException(
          getMessage('typeHintConfig_cannotActivateBeforeStartDate', dto.lang),
        );
      }
    }

    typeHintConfig.isActive = dto.isActive;

    if (typeHintConfig?.isDeleted && dto.isActive) {
      await this.unDelete(requestingUser, { lang: dto.lang }, id);
    }

    await typeHintConfig.save();

    return {
      isSuccess: true,
      message: getMessage(
        dto.isActive
          ? 'typeHintConfig_typeHintConfigActivatedSuccessfully'
          : 'typeHintConfig_typeHintConfigDeActivatedSuccessfully',
        dto.lang,
      ),
    };
  }
}
