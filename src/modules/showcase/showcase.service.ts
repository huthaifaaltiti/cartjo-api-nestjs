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
import { getMessage } from 'src/common/utils/translator';
import { validateUserRoleAccess } from 'src/common/utils/validateUserRoleAccess';
import { TypeHintConfigService } from '../typeHintConfig/typeHintConfig.service';
import { ShowCase, ShowCaseDocument } from 'src/schemas/showcase.schema';
import { Product, ProductDocument } from 'src/schemas/product.schema';
import { Locale } from 'src/types/Locale';
import {
  BaseResponse,
  DataListResponse,
  DataResponse,
} from 'src/types/service-response.type';
import { CreateDto } from './dto/create.dto';
import { UpdateDto } from './dto/update.dto';
import { DeleteDto } from './dto/delete.dto';
import { UnDeleteDto } from './dto/unDelete.dto';
import {
  TypeHintConfig,
  TypeHintConfigDocument,
} from 'src/schemas/typeHintConfig.schema';
import { WishList, WishListDocument } from 'src/schemas/wishList.schema';
import { SystemTypeHints } from 'src/enums/systemTypeHints.enum';
import { TYPE_HINT_THRESHOLDS } from 'src/configs/typeHint.config';
import { CRON_JOBS } from 'src/configs/cron.config';

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
  ) {}

  @Cron(CRON_JOBS.SHOWCASE.CHECK_INACTIVE_TYPE_HINT)
  async checkInactiveTypeHints(): Promise<void> {
    const inactiveHints = await this.typeHintConfigModel
      .find({ isActive: false })
      .lean();

    if (!inactiveHints.length) return;

    for (const hint of inactiveHints) {
      const showcases = await this.showcaseModel
        .find({ type: hint.key, isDeleted: false })
        .lean();

      if (!showcases.length) continue;

      await this.showcaseModel.updateMany(
        { type: hint.key },
        {
          $set: {
            isActive: false,
            reason: getMessage('showcase_typeHintNotActive'),
          },
        },
      );

      console.log(
        `Deactivated ${showcases.length} showcase(s) because type "${hint.key}" is inactive`,
      );
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

    // 1️⃣ Find active showcases within their dates
    const findQuery = {
      isActive: true,
      isDeleted: false,
      $or: [
        { $and: [{ startDate: { $lte: now } }, { endDate: { $gte: now } }] },
        {
          $and: [
            { startDate: { $lte: now } },
            { $or: [{ endDate: null }, { endDate: { $exists: false } }] },
          ],
        },
        {
          $and: [
            { $or: [{ startDate: null }, { startDate: { $exists: false } }] },
            { $or: [{ endDate: null }, { endDate: { $exists: false } }] },
          ],
        },
      ],
    };

    const showcases = await this.showcaseModel
      .find(findQuery)
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('unDeletedBy', 'firstName lastName email _id')
      .populate('createdBy', 'firstName lastName email _id')
      .lean();

    if (!showcases.length) {
      throw new NotFoundException(
        getMessage('showcase_noActiveShowcasesFound', lang),
      );
    }

    // 2️⃣ Get user's wishlisted products
    const wishListProducts: string[] = [];
    if (userId) {
      const wishList = await this.wishListModel
        .findOne({ user: userId })
        .lean();
      if (wishList) {
        wishListProducts.push(...wishList.products.map(p => p.toString()));
      }
    }

    const usedProductIds = new Set<string>();
    const populatedShowcases = [];

    // 4️⃣ Process each showcase sequentially
    for (const showcase of showcases) {
      const productsQuery: any = {
        isActive: true,
        isDeleted: false,
        _id: { $nin: Array.from(usedProductIds) },
      };

      // Determine dynamic query for system type hints
      switch (showcase.type) {
        case SystemTypeHints.MOST_VIEWED:
          productsQuery.viewCount = {
            $gte: TYPE_HINT_THRESHOLDS.most_viewed,
          };
          break;
        case SystemTypeHints.BEST_SELLERS:
          productsQuery.sellCount = { $gte: TYPE_HINT_THRESHOLDS.best_sellers };
          break;

        case SystemTypeHints.MOST_FAVORITED:
          productsQuery.favoriteCount = {
            $gte: TYPE_HINT_THRESHOLDS.most_favorited,
          };
          break;

        case SystemTypeHints.TRENDING:
          productsQuery.weeklyFavoriteCount = {
            $gte: TYPE_HINT_THRESHOLDS.trending,
          };
          break;

        default:
          productsQuery.typeHint = showcase.type;
      }

      const products = await this.productModel.aggregate([
        { $match: productsQuery },
        { $sample: { size: Number(limit) } },
        { $project: { __v: 0 } },
      ]);

      // Track used product IDs
      products.forEach(p => usedProductIds.add(String(p._id)));

      // Enrich products with isWishListed flag
      const enrichedProducts = products.map(p => ({
        ...p,
        isWishListed: wishListProducts.includes(String(p._id)),
      }));

      populatedShowcases.push({
        ...showcase,
        items: enrichedProducts,
      });
    }

    // 5️⃣ Add priority from typeHintConfig
    const showcasesWithPriority = await Promise.all(
      populatedShowcases.map(async showcase => {
        const typeHintConfig = await this.typeHintConfigModel
          .findOne({ key: showcase.type })
          .lean();

        return {
          ...showcase,
          priority: typeHintConfig?.priority ?? null,
        };
      }),
    );

    // 6️⃣ Return structured response
    return {
      isSuccess: true,
      message: getMessage(
        'showcase_activeShowcasesRetrievedSuccessfully',
        lang,
      ),
      dataCount: showcasesWithPriority.length,
      data: showcasesWithPriority,
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

  async create(
    requestingUser: any,
    dto: CreateDto,
  ): Promise<DataResponse<ShowCase>> {
    validateUserRoleAccess(requestingUser, dto.lang);

    // prevent create showcase without products from same type
    const foundProducts = await this.productModel.findOne({
      typeHint: dto.type,
      isDeleted: false,
      isActive: true,
      availableCount: { $gt: 0 },
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

    const showcase = await this.showcaseModel.create({
      title: { ar: dto.title_ar, en: dto.title_en },
      description: { ar: dto.description_ar, en: dto.description_en },
      showAllButtonText: {
        ar: dto.showAllButtonText_ar,
        en: dto.showAllButtonText_en,
      },
      showAllButtonLink: dto.showAllButtonLink,
      type: dto.type,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      isActive: true,
      isDeleted: false,
      createdBy: requestingUser?.userId,
    });

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

    if (!showcase || showcase.isDeleted) {
      throw new NotFoundException(
        getMessage('showcase_showcaseNotFound', dto.lang),
      );
    }

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

    if (dto.startDate) {
      showcase.startDate = new Date(dto.startDate);
    }
    if (dto.endDate) {
      showcase.endDate = new Date(dto.endDate);
    }

    showcase.updatedAt = new Date();
    showcase.updatedBy = requestingUser?.userId;

    await showcase.save();

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
        isDeleted: false,
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
  }
}
