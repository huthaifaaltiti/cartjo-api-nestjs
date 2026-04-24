import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { validateUserRoleAccess } from '../../common/utils/validateUserRoleAccess';
import { CreateDto } from './dto/create.dto';
import {
  TypeHintConfig,
  TypeHintConfigDocument,
} from '../../schemas/typeHintConfig.schema';
import { getMessage } from '../../common/utils/translator';
import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Locale } from '../../types/Locale';
import {
  BaseResponse,
  DataListResponse,
  DataResponse,
} from '../../types/service-response.type';
import { GetAllQueryDto } from './dto/get-all.dto';
import { UpdateDto } from './dto/update.dto';
import { DeleteDto } from './dto/delete.dto';
import { UpdateStatusBodyDto } from './dto/update-active-status.dto';
import { UnDeleteDto } from './dto/unDelete.dto';
import { GetListQueryDto } from './dto/get-list.dto';
import slugify from 'slugify';
import { ShowcaseService } from '../showcase/showcase.service';
import { SYSTEM_TYPE_HINTS } from '../../database/seeds/type-hints.seed';
import { SystemTypeHints } from '../../enums/systemTypeHints.enum';
import { CRON_JOBS } from '../../configs/cron.config';
import { ShowCase, ShowCaseDocument } from '../../schemas/showcase.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { HistoryService } from '../history/history.service';
import { LogModule } from '../../enums/logModules.enum';
import { LogAction } from '../../enums/logAction.enum';

export class TypeHintConfigService {
  private SYSTEM_TYPE_KEYS = SYSTEM_TYPE_HINTS.map(hint => hint.key);

  constructor(
    @InjectModel(TypeHintConfig.name)
    private typeHintConfigModel: Model<TypeHintConfigDocument>,

    @InjectModel(ShowCase.name)
    private readonly showcaseModel: Model<ShowCaseDocument>,

    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,

    // @Inject(forwardRef(() => ProductService))
    // private productService: ProductService,

    @Inject(forwardRef(() => ShowcaseService))
    private showcaseService: ShowcaseService,

    private historyService: HistoryService,
  ) {}

  @Cron(CRON_JOBS.TYPE_HINT.DEACTIVATE_EXPIRED_TYPE_HINTS)
  async deactivateExpiredTypeHintConfigs() {
    const now = new Date();

    try {
      const result = await this.typeHintConfigModel.updateMany(
        {
          isActive: true,
          isDeleted: false,
          endDate: { $ne: null, $lt: now }, // ensure endDate exists & expired
        },
        {
          $set: {
            isActive: false,
            isExpired: true,
            updatedAt: now,
          },
        },
      );

      if (result.modifiedCount > 0) {
        await this.historyService.log(
          LogModule.TYPE_HINT_CONFIG,
          LogAction.UPDATE,
          null, // system action
          null,
          {
            action: 'CRON_DEACTIVATE_EXPIRED_TYPE_HINT',
            affectedCount: result.modifiedCount,
            matchedCount: result.matchedCount,
          },
        );

        console.log(
          `[CRON] Deactivated ${result.modifiedCount} expired type-Hint Config`,
        );
      }
    } catch (error) {
      await this.historyService.log(
        LogModule.TYPE_HINT_CONFIG,
        LogAction.UPDATE,
        null,
        null,
        {
          action: 'CRON_DEACTIVATE_EXPIRED_TYPE_HINT_FAILED',
          error: (error as Error)?.message,
        },
      );

      console.error(
        '[CRON] Failed to deactivate expired type-Hint Configs:',
        error,
      );
    }
  }

  private computeIsExpired(endDate?: Date): boolean {
    const now = new Date();

    if (!endDate) return false;

    return endDate < now;
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

  async getList(
    reqUser: any,
    dto: GetListQueryDto,
  ): Promise<DataListResponse<string>> {
    const typeHintConfigs = await this.getActiveOnes(reqUser, dto.lang);
    const typeHintConfigsKeysList = typeHintConfigs?.data?.map(
      typeHintConfig => typeHintConfig?.key,
    );

    return {
      isSuccess: true,
      message: getMessage(
        'typeHintConfig_typeHintConfigsListRetrievedSuccessfully',
        dto?.lang,
      ),
      dataCount: typeHintConfigsKeysList?.length || 0,
      data: typeHintConfigsKeysList || [],
    };
  }

  async getActiveOnes(
    reqUser: any,
    lang?: Locale,
  ): Promise<DataListResponse<TypeHintConfigDocument>> {
    validateUserRoleAccess(reqUser, lang);

    const now = new Date();

    const findQuery = {
      isActive: true,
      isDeleted: false,
      isExpired: false,
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
    const { label_ar, label_en, priority, startDate, endDate, lang } = dto;

    validateUserRoleAccess(reqUser, lang);

    const key: string = label_en
      ? slugify(label_en, { lower: true })
      : undefined;

    // prevent creating system keys
    if (this.SYSTEM_TYPE_KEYS.includes(key as SystemTypeHints)) {
      throw new BadRequestException(
        getMessage('typeHintConfig_cannotCreateSystemTypeHint', lang),
      );
    }

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

    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : undefined;

    const typeHintData = {
      key,
      label: { ar: label_ar, en: label_en },
      priority,
      startDate: start,
      endDate: end,
      isActive: true,
      isDeleted: false,
      isExpired: this.computeIsExpired(end),
      createdBy: reqUser?.userId || null,
    };

    const typeHint = await this.typeHintConfigModel.create(typeHintData);

    // Log
    await this.historyService.log(
      LogModule.TYPE_HINT_CONFIG,
      LogAction.CREATE,
      reqUser?.userId,
      null,
      {
        typeHintConfigId: typeHint._id,
        title: typeHint.label,
      },
    );

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

    // notFound config
    if (!typeHintConfig) {
      throw new NotFoundException(
        getMessage('typeHintConfig_typeHintConfigNotFound', dto.lang),
      );
    }

    // deleted config
    if (typeHintConfig.isDeleted) {
      throw new NotFoundException(
        getMessage('typeHintConfig_cannotUpdateInActiveOrDeleted', dto.lang),
      );
    }

    // inactive configs
    if (!typeHintConfig.isActive && !typeHintConfig.isExpired) {
      throw new NotFoundException(
        getMessage('typeHintConfig_cannotUpdateInActiveOrDeleted', dto.lang),
      );
    }

    // system config
    if (typeHintConfig.isSystem) {
      throw new BadRequestException(
        getMessage('typeHintConfig_cannotChangeSystemKey', dto.lang),
      );
    }

    const before = typeHintConfig.toObject();

    const oldKey = typeHintConfig.key;

    const keyFromDto = dto.label_en
      ? slugify(dto.label_en, { lower: true })
      : oldKey;

    const isKeyChanged = keyFromDto !== oldKey;

    // prevent changing default/system keys
    if (
      isKeyChanged &&
      this.SYSTEM_TYPE_KEYS.includes(oldKey as SystemTypeHints)
    ) {
      throw new BadRequestException(
        getMessage('typeHintConfig_cannotUpdateDefaultKeys', dto.lang),
      );
    }

    // prevent key change if used
    if (isKeyChanged) {
      const [showcaseExists, productExists] = await Promise.all([
        this.showcaseModel.exists({ type: oldKey, isDeleted: false }),
        this.productModel.exists({
          typeHints: { $in: [oldKey] },
          isDeleted: false,
          isActive: true,
          isAvailable: true,
        }),
      ]);

      if (showcaseExists || productExists) {
        throw new BadRequestException(
          getMessage('typeHintConfig_cannotUpdateKeyBecauseItIsUsed', dto.lang),
        );
      }
    }

    // uniqueness check (key + labels)
    if (
      (dto.label_ar && dto.label_ar !== typeHintConfig.label.ar) ||
      (dto.label_en && dto.label_en !== typeHintConfig.label.en)
    ) {
      const conflict = await this.typeHintConfigModel.findOne({
        _id: { $ne: id },
        isDeleted: false,
        $or: [
          { key: keyFromDto },
          { 'label.ar': dto.label_ar },
          { 'label.en': dto.label_en },
        ],
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

    if (
      dto.priority &&
      Number(dto.priority) !== Number(typeHintConfig.priority)
    ) {
      typeHintConfig.priority = dto.priority;
    }

    const newStartDate = dto.startDate
      ? new Date(dto.startDate)
      : typeHintConfig.startDate;

    const newEndDate =
      dto.endDate !== undefined
        ? dto.endDate
          ? new Date(dto.endDate)
          : null
        : typeHintConfig.endDate;

    if (newStartDate && newEndDate && newEndDate < newStartDate) {
      throw new BadRequestException(
        getMessage('typeHintConfig_endDateMustBeAfterStartDate', dto.lang),
      );
    }

    if (isKeyChanged) typeHintConfig.key = keyFromDto;

    if (dto.label_ar || dto.label_en) {
      typeHintConfig.label = {
        ar: dto.label_ar ?? typeHintConfig.label.ar,
        en: dto.label_en ?? typeHintConfig.label.en,
      };
    }

    typeHintConfig.startDate = newStartDate;
    typeHintConfig.endDate = newEndDate;

    // If the config was expired but the admin set a valid new endDate, revive it
    const nowExpired = this.computeIsExpired(newEndDate);

    if (typeHintConfig.isExpired && !nowExpired) {
      typeHintConfig.isExpired = false;
      typeHintConfig.isActive = true; // re-activate since dates are now valid
    } else {
      typeHintConfig.isExpired = nowExpired;
    }

    typeHintConfig.updatedAt = new Date();
    typeHintConfig.updatedBy = reqUser?.userId;

    await typeHintConfig.save();

    // Log
    await this.historyService.log(
      LogModule.TYPE_HINT_CONFIG,
      LogAction.UPDATE,
      reqUser?.userId,
      null,
      {
        typeHintConfigId: id,
        title: typeHintConfig.label,
        before,
        after: typeHintConfig.toObject(),
      },
    );

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

    // prevent deleting system-type-hint
    if (typeHintConfig.isSystem) {
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

    // Log
    await this.historyService.log(
      LogModule.TYPE_HINT_CONFIG,
      LogAction.DELETE,
      requestingUser.userId,
      null,
      {
        typeHintConfigId: id,
        title: typeHintConfig.label,
      },
    );

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

    // prevent unDeleting system-type-hint
    if (typeHintConfig.isSystem) {
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

    // Log
    await this.historyService.log(
      LogModule.TYPE_HINT_CONFIG,
      LogAction.UNDELETE,
      requestingUser.userId,
      null,
      {
        typeHintConfigId: id,
        title: typeHintConfig.label,
      },
    );

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

    if (typeHintConfig.isSystem) {
      throw new ForbiddenException(
        getMessage(
          'typeHintConfig_cannotChangeStatusDefaultTypeHintConfig',
          dto.lang,
        ),
      );
    }

    if (typeHintConfig.isDeleted) {
      throw new BadRequestException(
        getMessage('typeHintConfig_cannotUpdateInActiveOrDeleted', dto.lang),
      );
    }

    // const now = new Date();

    if (dto.isActive) {
      const currentlyExpired = this.computeIsExpired(typeHintConfig.endDate);

      if (currentlyExpired) {
        throw new BadRequestException(
          getMessage('typeHintConfig_cannotActivateExpired', dto.lang),
        );
      }

      if (typeHintConfig.isExpired && !currentlyExpired) {
        typeHintConfig.isExpired = false;
      }
    } else {
      // deactivate showcases based on type-hint key
      await this.showcaseService.deactivateByTypeHint(
        typeHintConfig.key,
        requestingUser,
      );

      // deactivate products based on type-hint key
      // await this.productService.deactivateByTypeHint(
      //   typeHintConfig.key,
      //   requestingUser,
      // );
    }

    typeHintConfig.isActive = dto.isActive;

    await typeHintConfig.save();

    // Log
    await this.historyService.log(
      LogModule.TYPE_HINT_CONFIG,
      dto.isActive ? LogAction.ACTIVATE : LogAction.DEACTIVATE,
      requestingUser.userId,
      null,
      {
        typeHintConfigId: id,
        title: typeHintConfig.label,
      },
    );

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
