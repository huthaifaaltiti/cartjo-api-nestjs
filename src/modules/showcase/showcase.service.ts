import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Cron } from '@nestjs/schedule';
import { getMessage } from '../../common/utils/translator';
import { validateUserRoleAccess } from '../../common/utils/validateUserRoleAccess';
import { TypeHintConfigService } from '../typeHintConfig/typeHintConfig.service';
import { ShowCase, ShowCaseDocument } from '../../schemas/showcase.schema';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { Locale } from '../../types/Locale';
import {
  BaseResponse,
  DataListResponse,
  DataResponse,
} from '../../types/service-response.type';
import { CreateDto } from './dto/create.dto';
import { UpdateDto } from './dto/update.dto';
import { DeleteDto } from './dto/delete.dto';
import { UnDeleteDto } from './dto/unDelete.dto';
import {
  TypeHintConfig,
  TypeHintConfigDocument,
} from '../../schemas/typeHintConfig.schema';
import { WishList, WishListDocument } from '../../schemas/wishList.schema';
import { SystemTypeHints } from '../../enums/systemTypeHints.enum';
import { TYPE_HINT_THRESHOLDS } from '../../configs/typeHint.config';
import { CRON_JOBS } from '../../configs/cron.config';
import { LogModule } from '../../enums/logModules.enum';
import { LogAction } from '../../enums/LogAction.enum';
import { HistoryService } from '../history/history.service';

export class ShowcaseService {
  constructor(
    @InjectModel(ShowCase.name)
    private showcaseModel: Model<ShowCaseDocument>,

    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,

    @InjectModel(WishList.name)
    private wishListModel: Model<WishListDocument>,

    @InjectModel(TypeHintConfig.name)
    private typeHintConfigModel: Model<TypeHintConfigDocument>,

    @Inject(forwardRef(() => TypeHintConfigService))
    private typeHintConfigService: TypeHintConfigService,

    private historyService: HistoryService,
  ) {}

  @Cron(CRON_JOBS.SHOWCASE.DEACTIVATE_EXPIRED_SHOWCASES)
  async deactivateExpiredShowcases() {
    const now = new Date();

    try {
      const result = await this.showcaseModel.updateMany(
        {
          isActive: true,
          isDeleted: false,
          isExpired: false,
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
        // Log
        await this.historyService.log(
          LogModule.SHOWCASE,
          LogAction.UPDATE,
          null, // system
          null,
          {
            action: 'CRON_DEACTIVATE_EXPIRED',
            affectedCount: result.modifiedCount,
          },
        );

        console.log(
          `[CRON] Deactivated ${result.modifiedCount} expired showcases`,
        );
      }
    } catch (error) {
      // Log
      await this.historyService.log(
        LogModule.SHOWCASE,
        LogAction.UPDATE,
        null,
        null,
        {
          action: 'CRON_DEACTIVATE_FAILED',
          error: (error as Error)?.message,
        },
      );
      console.error('[CRON] Failed to deactivate expired showcases:', error);
    }
  }

  @Cron(CRON_JOBS.SHOWCASE.CHECK_INACTIVE_TYPE_HINT)
  async checkInactiveTypeHints(): Promise<void> {
    try {
      const inactiveHints = await this.typeHintConfigModel
        .find({ isActive: false })
        .lean();

      if (!inactiveHints.length) {
        await this.historyService.log(
          LogModule.SHOWCASE,
          LogAction.UPDATE,
          null,
          null,
          {
            action: 'CRON_CHECK_INACTIVE_TYPE_HINT',
            message: 'No inactive type hints found',
          },
        );
        return;
      }

      for (const hint of inactiveHints) {
        const showcases = await this.showcaseModel
          .find({ type: hint.key, isDeleted: false })
          .lean();

        if (!showcases.length) continue;

        const result = await this.showcaseModel.updateMany(
          { type: hint.key },
          {
            $set: {
              isActive: false,
              reason: getMessage('showcase_typeHintNotActive'),
            },
          },
        );

        // Log
        await this.historyService.log(
          LogModule.SHOWCASE,
          LogAction.UPDATE,
          null, // system action
          null,
          {
            action: 'CRON_DEACTIVATE_BY_INACTIVE_TYPE_HINT',
            typeHint: hint.key,
            affectedCount: result.modifiedCount,
            showcaseIds: showcases.map(s => s._id),
          },
        );
      }
    } catch (error) {
      // Log
      await this.historyService.log(
        LogModule.SHOWCASE,
        LogAction.UPDATE,
        null,
        null,
        {
          action: 'CRON_CHECK_INACTIVE_TYPE_HINT_FAILED',
          error: (error as Error)?.message,
        },
      );

      throw error;
    }
  }

  async getAll(
    requestingUser: any,
    params: {
      lang?: Locale;
      limit?: string;
      lastId?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<DataListResponse<ShowCase>> {
    validateUserRoleAccess(requestingUser, params.lang);

    const {
      lang = 'en',
      limit = '10',
      lastId,
      search,
      startDate,
      endDate,
    } = params;

    const query: any = {};

    // Pagination
    if (lastId) {
      query._id = { $lt: new Types.ObjectId(lastId) };
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { [`title.${lang}`]: searchRegex },
        { [`description.${lang}`]: searchRegex },
        { type: searchRegex },
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

    const showcases = await this.showcaseModel
      .find(query)
      .sort({ _id: -1 })
      .limit(Number(limit))
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('createdBy', 'firstName lastName email _id')
      .populate('updatedBy', 'firstName lastName email _id')
      .select('-__v')
      .lean();

    const showcasesWithPriority = await Promise.all(
      showcases.map(async showcase => {
        const typeHintConfig = await this.typeHintConfigModel
          .findOne({ key: showcase.type })
          .lean();

        return {
          ...showcase,
          priority: typeHintConfig?.priority ?? null,
        };
      }),
    );

    return {
      isSuccess: true,
      message: getMessage('showcase_showcasesRetrievedSuccessfully', lang),
      dataCount: showcasesWithPriority.length,
      data: showcasesWithPriority,
    };
  }

  async getActiveOnes(
    lang?: Locale,
    limit: number = 3,
    userId?: mongoose.Types.ObjectId,
  ): Promise<DataListResponse<ShowCase>> {
    const now = new Date();

    const findQuery = {
      isActive: true,
      isDeleted: false,
      isExpired: false,
      $or: [
        { startDate: { $lte: now }, endDate: { $gte: now } },
        {
          startDate: { $lte: now },
          $or: [{ endDate: null }, { endDate: { $exists: false } }],
        },
        {
          $or: [{ startDate: null }, { startDate: { $exists: false } }],
          $and: [{ $or: [{ endDate: null }, { endDate: { $exists: false } }] }],
        },
      ],
    };

    const [showcases, wishlist, typeHintsConfigs] = await Promise.all([
      this.showcaseModel
        .find(findQuery)
        .populate('deletedBy', 'firstName lastName email _id')
        .populate('unDeletedBy', 'firstName lastName email _id')
        .populate('createdBy', 'firstName lastName email _id')
        .lean(),
      userId ? this.wishListModel.findOne({ user: userId }).lean() : null,
      this.typeHintConfigModel.find().lean(),
    ]);

    if (!showcases.length) {
      throw new NotFoundException(
        getMessage('showcase_noActiveShowcasesFound', lang),
      );
    }

    // Active type-hint configs
    const activeTypeHintKeys = new Set(
      typeHintsConfigs
        .filter(c => c.isActive && !c.isDeleted && !c.isExpired)
        .map(c => c.key),
    );

    const activeShowcases = showcases.filter(s =>
      activeTypeHintKeys.has(s.type),
    );

    if (!activeShowcases.length) {
      throw new NotFoundException(
        getMessage('showcase_noActiveShowcasesFound', lang),
      );
    }

    const priorityMap = new Map(typeHintsConfigs.map(c => [c.key, c.priority]));
    const wishListSet = new Set(
      wishlist?.products?.map(p => p.toString()) || [],
    );

    const strategy: Record<string, any> = {
      [SystemTypeHints.MOST_VIEWED]: {
        viewCount: { $gte: TYPE_HINT_THRESHOLDS.most_viewed },
      },
      [SystemTypeHints.BEST_SELLERS]: {
        totalSellCount: { $gte: TYPE_HINT_THRESHOLDS.best_sellers },
      },
      [SystemTypeHints.MOST_FAVORITED]: {
        favoriteCount: { $gte: TYPE_HINT_THRESHOLDS.most_favorited },
      },
      [SystemTypeHints.TRENDING]: {
        weeklyFavoriteCount: { $gte: TYPE_HINT_THRESHOLDS.trending },
      },
    };

    const populatedShowcases = await Promise.all(
      activeShowcases.map(async showcase => {
        // Build product match stage based on showcase type
        const productMatchStage: any = {
          isActive: true,
          isDeleted: false,
          ...(strategy[showcase.type] ?? { typeHints: showcase.type }),
        };

        const products = await this.productModel.aggregate([
          { $match: productMatchStage },

          // Lookup & require active category
          {
            $lookup: {
              from: 'categories',
              localField: 'categoryId',
              foreignField: '_id',
              as: 'categoryId',
            },
          },
          {
            $unwind: {
              path: '$categoryId',
              preserveNullAndEmptyArrays: false,
            },
          },
          {
            $match: {
              'categoryId.isActive': true,
              'categoryId.isDeleted': false,
            },
          },

          // Lookup & require active subcategory
          {
            $lookup: {
              from: 'subCategories', // ← verify collection name
              localField: 'subCategoryId',
              foreignField: '_id',
              as: 'subCategoryId',
            },
          },
          {
            $addFields: {
              subCategoryId: {
                $cond: {
                  if: { $gt: [{ $size: '$subCategoryId' }, 0] },
                  then: { $arrayElemAt: ['$subCategoryId', 0] },
                  else: null,
                },
              },
            },
          },
          {
            $match: {
              subCategoryId: { $ne: null },
              'subCategoryId.isActive': true,
              'subCategoryId.isDeleted': false,
            },
          },

          // Lookup createdBy
          {
            $lookup: {
              from: 'users',
              localField: 'createdBy',
              foreignField: '_id',
              pipeline: [{ $project: { firstName: 1, lastName: 1, email: 1 } }],
              as: 'createdBy',
            },
          },
          {
            $addFields: {
              createdBy: {
                $cond: {
                  if: { $gt: [{ $size: '$createdBy' }, 0] },
                  then: { $arrayElemAt: ['$createdBy', 0] },
                  else: null,
                },
              },
            },
          },

          // Lookup deletedBy
          {
            $lookup: {
              from: 'users',
              localField: 'deletedBy',
              foreignField: '_id',
              pipeline: [{ $project: { firstName: 1, lastName: 1, email: 1 } }],
              as: 'deletedBy',
            },
          },
          {
            $addFields: {
              deletedBy: {
                $cond: {
                  if: { $gt: [{ $size: '$deletedBy' }, 0] },
                  then: { $arrayElemAt: ['$deletedBy', 0] },
                  else: null,
                },
              },
            },
          },

          // Lookup unDeletedBy
          {
            $lookup: {
              from: 'users',
              localField: 'unDeletedBy',
              foreignField: '_id',
              pipeline: [{ $project: { firstName: 1, lastName: 1, email: 1 } }],
              as: 'unDeletedBy',
            },
          },
          {
            $addFields: {
              unDeletedBy: {
                $cond: {
                  if: { $gt: [{ $size: '$unDeletedBy' }, 0] },
                  then: { $arrayElemAt: ['$unDeletedBy', 0] },
                  else: null,
                },
              },
            },
          },

          // Random sample of exactly `limit` valid products
          { $sample: { size: Number(limit) } },
        ]);

        return {
          ...showcase,
          priority: priorityMap.get(showcase.type) ?? null,
          items: products.map(p => ({
            ...p,
            isWishListed: wishListSet.has(p._id.toString()),
          })),
        };
      }),
    );

    return {
      isSuccess: true,
      message: getMessage(
        'showcase_activeShowcasesRetrievedSuccessfully',
        lang,
      ),
      dataCount: populatedShowcases.length,
      data: populatedShowcases,
    };
  }

  async getOne(
    requestingUser: any,
    id: string,
    lang?: Locale,
  ): Promise<DataResponse<ShowCase>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(
        getMessage('showcase_invalidShowcaseId', lang),
      );
    }

    validateUserRoleAccess(requestingUser, lang);

    const showcase = await this.showcaseModel
      .findById(id)
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('unDeletedBy', 'firstName lastName email _id')
      .populate('createdBy', 'firstName lastName email _id')
      .lean();

    const { priority } = await this.typeHintConfigModel.findOne({
      key: showcase?.type,
    });

    if (!showcase) {
      throw new NotFoundException(
        getMessage('showcase_showcaseNotFound', lang),
      );
    }

    return {
      isSuccess: true,
      message: getMessage('showcase_showcaseRetrievedSuccessfully', lang),
      data: { ...showcase, priority },
    };
  }

  private computeIsExpired(endDate?: Date): boolean {
    const now = new Date();

    if (!endDate) return false;

    return endDate < now;
  }

  async create(
    requestingUser: any,
    dto: CreateDto,
  ): Promise<DataResponse<ShowCase>> {
    validateUserRoleAccess(requestingUser, dto.lang);

    // prevent create showcase without products from same type
    const foundProducts = await this.productModel.findOne({
      typeHints: { $in: [dto.type] },
      isDeleted: false,
      isActive: true,
      isAvailable: true,
    });

    if (!foundProducts) {
      throw new BadRequestException(
        getMessage('showcase_noProductsWithThisTypeForShowcase', dto.lang),
      );
    }

    const existing = await this.showcaseModel.findOne({
      $or: [
        { 'title.ar': dto.title_ar },
        { 'title.en': dto.title_en },
        { 'description.ar': dto.description_ar },
        { 'description.en': dto.description_en },
      ],
      isDeleted: false,
    });

    if (existing) {
      throw new BadRequestException(
        getMessage('showcase_showcaseWithThisDetailsAlreadyExist', dto.lang),
      );
    }

    // Get type hint config by key
    const typeHintKeys = await this.typeHintConfigService.getList(
      requestingUser,
      {
        lang: dto.lang,
      },
    );

    if (!typeHintKeys.data.includes(dto.type)) {
      throw new BadRequestException(
        getMessage('showcase_invalidTypeHint', dto.lang),
      );
    }

    // Check if type hint is active
    const typeHintConfig = await this.typeHintConfigModel.findOne({
      key: dto.type,
    });

    if (!typeHintConfig.isActive) {
      throw new BadRequestException(
        getMessage('showcase_typeHintNotActive', dto.lang),
      );
    }

    const start = dto.startDate ? new Date(dto.startDate) : new Date();
    const end = dto.endDate ? new Date(dto.endDate) : undefined;

    const showcase = await this.showcaseModel.create({
      title: { ar: dto.title_ar, en: dto.title_en },
      description: { ar: dto.description_ar, en: dto.description_en },
      showAllButtonText: {
        ar: dto.showAllButtonText_ar,
        en: dto.showAllButtonText_en,
      },
      showAllButtonLink: dto.showAllButtonLink,
      type: dto.type,
      startDate: start,
      endDate: end,
      isActive: true,
      isDeleted: false,
      isExpired: this.computeIsExpired(end),
      createdBy: requestingUser?.userId,
    });

    // Log
    await this.historyService.log(
      LogModule.SHOWCASE,
      LogAction.CREATE,
      requestingUser?.userId,
      null,
      {
        showcaseId: showcase._id,
        title: showcase.title,
      },
    );

    return {
      isSuccess: true,
      message: getMessage('showcase_showcaseCreatedSuccessfully', dto.lang),
      data: showcase.toObject(),
    };
  }

  async update(
    requestingUser: any,
    id: string,
    dto: UpdateDto,
  ): Promise<DataResponse<ShowCase>> {
    validateUserRoleAccess(requestingUser, dto.lang);

    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(
        getMessage('showcase_invalidShowcaseId', dto.lang),
      );
    }

    const showcase = await this.showcaseModel.findById(id);

    if (!showcase) {
      throw new NotFoundException(
        getMessage('showcase_showcaseNotFound', dto.lang),
      );
    }

    // Deleted
    if (showcase.isDeleted) {
      throw new NotFoundException(
        getMessage('showcase_cannotUpdateInActiveOrDeleted', dto.lang),
      );
    }

    // inactive
    if (!showcase.isActive && !showcase.isExpired) {
      throw new NotFoundException(
        getMessage('showcase_cannotUpdateInActiveOrDeleted', dto.lang),
      );
    }

    // system
    if (showcase.isSystem) {
      throw new BadRequestException(
        getMessage('showcase_cannotModifySystemProperties', dto.lang),
      );
    }

    const before = showcase.toObject();

    // Check for conflicts on title if updated
    if (
      (dto.title_ar && dto.title_ar !== showcase.title.ar) ||
      (dto.title_en && dto.title_en !== showcase.title.en)
    ) {
      const conflict = await this.showcaseModel.findOne({
        _id: { $ne: id },
        $or: [{ 'title.ar': dto.title_ar }, { 'title.en': dto.title_en }],
        isDeleted: false,
      });

      if (conflict) {
        throw new BadRequestException(
          getMessage('showcase_showcaseWithThisDetailsAlreadyExist', dto.lang),
        );
      }
    }

    // Check if type hint is active
    const typeHintConfig = await this.typeHintConfigModel.findOne({
      key: dto.type,
    });

    if (!typeHintConfig.isActive) {
      throw new BadRequestException(
        getMessage('showcase_typeHintNotActive', dto.lang),
      );
    }

    // Update fields
    if (dto.title_ar || dto.title_en) {
      showcase.title = {
        ar: dto.title_ar || showcase.title.ar,
        en: dto.title_en || showcase.title.en,
      };
    }
    if (dto.description_ar || dto.description_en) {
      showcase.description = {
        ar: dto.description_ar || showcase.description.ar,
        en: dto.description_en || showcase.description.en,
      };
    }
    if (dto.showAllButtonText_ar || dto.showAllButtonText_en) {
      showcase.showAllButtonText = {
        ar: dto.showAllButtonText_ar || showcase.showAllButtonText.ar,
        en: dto.showAllButtonText_en || showcase.showAllButtonText.en,
      };
    }
    if (dto.showAllButtonLink) {
      showcase.showAllButtonLink = dto.showAllButtonLink;
    }

    if (dto.type) {
      const typeHintKeys = await this.typeHintConfigService.getList(
        requestingUser,
        {
          lang: dto.lang,
        },
      );

      if (!typeHintKeys.data.includes(dto.type)) {
        throw new BadRequestException(
          getMessage('showcase_invalidTypeHint', dto.lang),
        );
      }

      showcase.type = dto.type;
    }

    const newStartDate =
      dto.startDate !== undefined
        ? dto.startDate
          ? new Date(dto.startDate)
          : null
        : showcase.startDate;

    const newEndDate =
      dto.endDate !== undefined
        ? dto.endDate
          ? new Date(dto.endDate)
          : null
        : showcase.endDate;

    if (newStartDate && newEndDate && newEndDate < newStartDate) {
      throw new BadRequestException(
        getMessage('showcase_endDateMustBeAfterStartDate', dto.lang),
      );
    }

    const nowExpired = this.computeIsExpired(newEndDate);

    if (showcase.isExpired && !nowExpired) {
      showcase.isExpired = false;
      showcase.isActive = true; // revive if admin fixed date
    } else {
      showcase.isExpired = nowExpired;
    }

    showcase.startDate = newStartDate;
    showcase.endDate = newEndDate;

    showcase.updatedAt = new Date();
    showcase.updatedBy = requestingUser?.userId;

    await showcase.save();

    // Log
    await this.historyService.log(
      LogModule.SHOWCASE,
      LogAction.UPDATE,
      requestingUser?.userId,
      null,
      {
        showcaseId: id,
        title: showcase.title,
        before,
        after: showcase.toObject(),
      },
    );

    return {
      isSuccess: true,
      message: getMessage('showcase_showcaseUpdatedSuccessfully', dto.lang),
      data: showcase.toObject(),
    };
  }

  async delete(
    requestingUser: any,
    body: DeleteDto,
    id: string,
  ): Promise<BaseResponse> {
    const { lang } = body;

    validateUserRoleAccess(requestingUser, lang);

    const showcase = await this.showcaseModel.findById(id);

    const typeHintConfig = await this.typeHintConfigModel.findOne({
      key: showcase.type,
      isDeleted: false,
    });

    if (typeHintConfig?.isSystem) {
      throw new ForbiddenException(
        getMessage('showcase_cannotModifySystemShowcase', lang),
      );
    }

    if (!showcase) {
      throw new NotFoundException(
        getMessage('showcase_showcaseNotFound', lang),
      );
    }

    showcase.isDeleted = true;
    showcase.isActive = false;
    showcase.deletedAt = new Date();
    showcase.deletedBy = requestingUser.userId;
    showcase.unDeletedBy = null;

    await showcase.save();

    // Log
    await this.historyService.log(
      LogModule.SHOWCASE,
      LogAction.DELETE,
      requestingUser.userId,
      null,
      {
        showcaseId: showcase._id,
        title: showcase.title,
      },
    );

    return {
      isSuccess: true,
      message: getMessage('showcase_showcaseDeletedSuccessfully', lang),
    };
  }

  async unDelete(
    requestingUser: any,
    body: UnDeleteDto,
    id: string,
  ): Promise<BaseResponse> {
    const { lang } = body;

    validateUserRoleAccess(requestingUser, lang);

    const showcase = await this.showcaseModel.findById(id);

    if (!showcase) {
      throw new NotFoundException(
        getMessage('showcase_showcaseNotFound', lang),
      );
    }

    const typeHintConfig = await this.typeHintConfigModel.findOne({
      key: showcase.type,
      isDeleted: false,
    });

    if (typeHintConfig?.isSystem) {
      throw new ForbiddenException(
        getMessage('showcase_cannotModifySystemShowcase', lang),
      );
    }

    showcase.isDeleted = false;
    showcase.deletedAt = null;
    showcase.deletedBy = null;
    showcase.unDeletedBy = requestingUser.userId;
    showcase.unDeletedAt = new Date();

    await showcase.save();

    // Log
    await this.historyService.log(
      LogModule.SHOWCASE,
      LogAction.UNDELETE,
      requestingUser.userId,
      null,
      {
        showcaseId: showcase._id,
        title: showcase.title,
      },
    );

    return {
      isSuccess: true,
      message: getMessage('showcase_showcaseUnDeletedSuccessfully', lang),
    };
  }

  async updateStatus(
    id: string,
    isActive: boolean,
    lang: Locale = 'en',
    requestingUser: any,
  ): Promise<BaseResponse> {
    validateUserRoleAccess(requestingUser, lang);

    const showcase = await this.showcaseModel.findById(id);

    if (!showcase) {
      throw new NotFoundException(
        getMessage('showcase_showcaseNotFound', lang),
      );
    }

    const typeHintConfig = await this.typeHintConfigModel.findOne({
      key: showcase.type,
      isDeleted: false,
    });

    if (typeHintConfig?.isSystem) {
      throw new ForbiddenException(
        getMessage('showcase_cannotModifySystemShowcase', lang),
      );
    }

    const now = new Date();

    if (isActive) {
      // ✅ 1. CHECK PARENT TYPE HINT STATUS
      const typeHintConfig = await this.typeHintConfigModel.findOne({
        key: showcase.type,
        isActive: true,
        isDeleted: false,
        isExpired: false,
      });

      if (!typeHintConfig) {
        throw new BadRequestException(
          getMessage('showcase_invalidTypeHint', lang),
        );
      }

      if (!typeHintConfig.isActive) {
        throw new BadRequestException(
          getMessage('showcase_typeHintKeyNotActive', lang),
        );
      }

      // ✅ 2. DATE VALIDATIONS
      if (showcase.endDate && showcase.endDate < now) {
        throw new BadRequestException(
          getMessage('showcase_cannotActivateExpired', lang),
        );
      }

      // Optional: Prevent activation if start date is in the future
      if (showcase.startDate && showcase.startDate > now) {
        throw new BadRequestException(
          getMessage('showcase_cannotActivateBeforeStartDate', lang),
        );
      }
    }

    showcase.isActive = isActive;

    if (showcase?.isDeleted && isActive) {
      await this.unDelete(requestingUser, { lang }, id);
    }

    await showcase.save();

    // Log
    await this.historyService.log(
      LogModule.SHOWCASE,
      LogAction.UPDATE,
      requestingUser.userId,
      null,
      {
        showcaseId: id,
        isActive,
      },
    );

    return {
      isSuccess: true,
      message: getMessage(
        isActive
          ? 'showcase_showcaseActivatedSuccessfully'
          : 'showcase_showcaseDeActivatedSuccessfully',
        lang,
      ),
    };
  }

  async deactivateByTypeHint(
    typeHint: string,
    requestingUser: any,
  ): Promise<void> {
    await this.showcaseModel.updateMany(
      {
        type: typeHint,
        isActive: true,
      },
      {
        $set: {
          isActive: false,
          isDeleted: false,
          updatedBy: requestingUser.userId,
          updatedAt: new Date(),
        },
      },
    );

    // Log
    await this.historyService.log(
      LogModule.SHOWCASE,
      LogAction.UPDATE,
      requestingUser?.userId,
      null,
      {
        action: 'DEACTIVATE_BY_TYPE_HINT',
        typeHint,
      },
    );
  }
}
