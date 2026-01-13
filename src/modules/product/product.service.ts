import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import slugify from 'slugify';
import mongoose, { Model, Types } from 'mongoose';
import {
  BaseResponse,
  DataListResponse,
  DataResponse,
} from 'src/types/service-response.type';
import { Product, ProductDocument } from 'src/schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductBodyDto } from './dto/update-product.dto';
import { Locale } from 'src/types/Locale';
import { Category, CategoryDocument } from 'src/schemas/category.schema';
import { DeleteProductDto } from './dto/delete-product.dto';
import { UnDeleteProductBodyDto } from './dto/unDelete-product.dto';
import { Modules } from 'src/enums/appModules.enum';
import { MediaService } from '../media/media.service';
import { TypeHintConfigService } from '../typeHintConfig/typeHintConfig.service';
import { validateUserRoleAccess } from 'src/common/utils/validateUserRoleAccess';
import { getMessage } from 'src/common/utils/translator';
import { fileSizeValidator } from 'src/common/functions/validators/fileSizeValidator';
import { WishList, WishListDocument } from 'src/schemas/wishList.schema';
import { GetProductsQueryDto } from './dto/get-products.dto';
import { MEDIA_CONFIG } from 'src/configs/media.config';
import { fileTypeValidator } from 'src/common/functions/validators/fileTypeValidator';
import {
  SubCategory,
  SubCategoryDocument,
} from 'src/schemas/subCategory.schema';
import {
  TypeHintConfig,
  TypeHintConfigDocument,
} from 'src/schemas/typeHintConfig.schema';
import { SystemTypeHints } from 'src/enums/systemTypeHints.enum';
import { Cron } from '@nestjs/schedule';
import { WEEKLY_SCORE_WEIGHTS } from 'src/configs/weeklyScoreWeights.config';
import { CRON_JOBS } from 'src/configs/cron.config';
import {
  SYSTEM_GENERATED_HINTS,
  SystemGeneratedHint,
} from 'src/configs/typeHint.config';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,

    private mediaService: MediaService,

    @InjectModel(SubCategory.name)
    private subCategoryModel: Model<SubCategoryDocument>,

    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,

    @InjectModel(WishList.name)
    private wishListModel: Model<WishListDocument>,

    private typeHintConfigService: TypeHintConfigService,

    @InjectModel(TypeHintConfig.name)
    private typeHintConfigModel: Model<TypeHintConfigDocument>,
  ) {}

  @Cron(CRON_JOBS.PRODUCT.RESET_WEEKLY_STATS)
  async resetWeeklyStats() {
    await this.productModel.updateMany(
      {},
      {
        $set: {
          weeklyViewCount: 0,
          weeklyFavoriteCount: 0,
          weeklyScore: 0,
        },
      },
    );
  }

  async incrementView(productId: string) {
    if (!Types.ObjectId.isValid(productId)) return;

    await this.productModel.updateOne(
      { _id: productId, isActive: true, isDeleted: false },
      {
        $inc: {
          viewCount: 1,
          weeklyViewCount: 1,
          weeklyScore: WEEKLY_SCORE_WEIGHTS.view,
        },
      },
    );
  }

  async getAll(
    params: GetProductsQueryDto,
    userId?: mongoose.Types.ObjectId,
  ): Promise<DataListResponse<Product>> {
    const {
      lang = 'en',
      limit = 10,
      lastId,
      search,
      categoryId,
      subCategoryId,
      priceFrom,
      priceTo,
      ratingFrom,
      ratingTo,
      createdFrom,
      createdTo,
      beforeNumOfDays,
      typeHint,
    } = params;

    const query: any = {};
    const sort: any = { _id: -1 };

    if (lastId) {
      query._id = { $lt: new Types.ObjectId(lastId) };
    }

    // ✅ CRITICAL FIX: System-generated hints (MOST_VIEWED, TRENDING)
    // should NOT filter by typeHint field - they only affect sorting
    const isSystemGeneratedHint = SYSTEM_GENERATED_HINTS.includes(
      typeHint as SystemGeneratedHint,
    );

    // Only filter by typeHint if it's NOT a system-generated hint
    if (typeHint && !isSystemGeneratedHint) {
      query.typeHint = { $in: [typeHint] };
    }

    // ✅ MOST_VIEWED: Filter active products and sort by viewCount
    if (typeHint === SystemTypeHints.MOST_VIEWED) {
      query.isActive = true;
      query.isDeleted = false;
      sort.viewCount = -1;
      delete sort._id;
    }

    // ✅ TRENDING: Filter active products and sort by weekly metrics
    if (typeHint === SystemTypeHints.TRENDING) {
      query.isActive = true;
      query.isDeleted = false;
      sort.weeklyScore = -1;
      sort.weeklyFavoriteCount = -1;
      sort.weeklyViewCount = -1;
      delete sort._id;
    }

    /*
    ✅ 1.3 Fetch MOST_VIEWED Products (IMPORTANT)

You must SORT, not $sample.

🔥 Add support inside getAll

Extend your typeHint logic:

if (typeHint === SystemTypeHints.MOST_VIEWED) {
  query.isActive = true;
  query.isDeleted = false;
}


Then change sorting dynamically:

const sort: any = { _id: -1 };

if (typeHint === SystemTypeHints.MOST_VIEWED) {
  sort.viewCount = -1;
  delete sort._id;
}


Use it:

const products = await this.productModel
  .find(query)
  .sort(sort)
  .limit(Number(limit))
  .populate(...)
  .lean();


✅ MOST_VIEWED now truly means highest viewCount first
    */

    if (categoryId) {
      query.categoryId = new Types.ObjectId(categoryId);
    }

    if (subCategoryId) {
      query.subCategoryId = new Types.ObjectId(subCategoryId);
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { 'name.ar': searchRegex },
        { 'name.en': searchRegex },
        { 'description.ar': searchRegex },
        { 'description.en': searchRegex },
        { slug: searchRegex },
      ];
    }

    // ✅ Dynamic filters
    if (priceFrom || priceTo) {
      query.price = {};

      if (priceFrom) query.price.$gte = Number(priceFrom);
      if (priceTo) query.price.$lte = Number(priceTo);
    }

    if (ratingFrom || ratingTo) {
      query.ratings = {};

      if (ratingFrom) query.ratings.$gte = Number(ratingFrom);
      if (ratingTo) query.ratings.$lte = Number(ratingTo);
    }

    if (beforeNumOfDays) {
      let days = Number(beforeNumOfDays);

      if (days > 36500) {
        // ~100 years sanity cap
        days = 36500;
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      query.createdAt = { $lte: cutoffDate };
    } else if (createdFrom || createdTo) {
      query.createdAt = {};

      if (createdFrom) query.createdAt.$gte = new Date(createdFrom);
      if (createdTo) query.createdAt.$lte = new Date(createdTo);
    }

    // ✅ MOST_VIEWED: Filter active products and sort by viewCount
    if (typeHint === SystemTypeHints.MOST_VIEWED) {
      query.isActive = true;
      query.isDeleted = false;
      sort.viewCount = -1;
      delete sort._id;
    }

    // ✅ TRENDING: Sort by weekly metrics
    if (typeHint === SystemTypeHints.TRENDING) {
      query.isActive = true;
      query.isDeleted = false;
      sort.weeklyScore = -1;
      sort.weeklyFavoriteCount = -1;
      sort.weeklyViewCount = -1;
      delete sort._id;
    }

    const products = await this.productModel
      .find(query)
      // .sort({ _id: -1 }) // Sorting by .sort({ createdAt: -1 }) ensures most recent products appear first.
      .sort(sort)
      .limit(Number(limit))
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('unDeletedBy', 'firstName lastName email _id')
      .populate('createdBy', 'firstName lastName email _id')
      .populate('categoryId')
      .populate('subCategoryId')
      .populate('mainMediaId')
      .populate('mediaListIds')
      .lean();

    // Enrich with isWishListed per user
    let wishListProducts: string[] = [];
    if (userId) {
      const wishList = await this.wishListModel
        .findOne({ user: userId })
        .lean();

      if (wishList) {
        wishListProducts = wishList.products.map(p => p.toString());
      }
    }

    const enrichedProducts = products.map(p => ({
      ...p,
      isWishListed: wishListProducts.includes(p._id.toString()),
    }));

    return {
      isSuccess: true,
      message: getMessage('products_productsRetrievedSuccessfully', lang),
      dataCount: enrichedProducts.length,
      data: enrichedProducts,
    };
  }

  async getCategoriesPicks(
    params: {
      lang?: Locale;
      limit?: string;
      categoryId?: string;
    },
    userId?: mongoose.Types.ObjectId,
  ): Promise<DataListResponse<Product>> {
    const { lang = 'en', limit = 10, categoryId } = params;

    if (!categoryId) {
      throw new BadRequestException(
        getMessage('products_requiredCategoryId', lang),
      );
    }

    // search active items bu category
    const findQuery: any = {
      isActive: true,
      isDeleted: false,
      categoryId: new Types.ObjectId(categoryId),
    };

    // ✅ Get random products each request
    const products = await this.productModel
      .aggregate([
        { $match: findQuery },
        { $sample: { size: Number(limit) } }, // randomize products
      ])
      .exec();

    if (!products.length) {
      // throw new NotFoundException(
      //   getMessage('products_productsNotFound', lang),
      // );

      return {
        isSuccess: true,
        message: getMessage('products_noProductsForCategory', lang),
        dataCount: 0,
        data: [],
      };
    }

    // ✅ Fetch wishlist for user
    let wishListProducts: string[] = [];
    if (userId) {
      const wishList = await this.wishListModel
        .findOne({ user: userId })
        .lean();
      if (wishList) {
        wishListProducts = wishList.products.map(p => p.toString());
      }
    }

    // ✅ Enrich with wishlist status
    const enrichedProducts = products.map((p: any) => ({
      ...p,
      isWishListed: wishListProducts.includes(p._id.toString()),
    }));

    return {
      isSuccess: true,
      message: getMessage('products_productsRetrievedSuccessfully', lang),
      dataCount: enrichedProducts.length,
      data: enrichedProducts,
    };
  }

  async geSuggestedItems(
    params: {
      lang?: Locale;
      limit?: string;
      categoryId?: string;
      subCategoryId?: string;
    },
    userId?: mongoose.Types.ObjectId,
  ) {
    const { lang = 'en', limit = 10, categoryId, subCategoryId } = params;

    const match: any = {};

    if (categoryId) {
      match.categoryId = new Types.ObjectId(categoryId);
    }

    if (subCategoryId) {
      match.subCategoryId = new Types.ObjectId(subCategoryId);
    }

    // Use aggregation pipeline with $sample for randomness
    const products = await this.productModel.aggregate([
      { $match: match },
      { $sample: { size: Number(limit) } }, // random N docs
    ]);

    // Populate fields manually since aggregate doesn't auto-populate
    const populatedProducts = await this.productModel.populate(products, [
      { path: 'deletedBy', select: 'firstName lastName email _id' },
      { path: 'unDeletedBy', select: 'firstName lastName email _id' },
      { path: 'createdBy', select: 'firstName lastName email _id' },
      { path: 'categoryId' },
      { path: 'subCategoryId' },
      { path: 'mainMediaId' },
      { path: 'mediaListIds' },
    ]);

    // Enrich with isWishListed per user
    let wishListProducts: string[] = [];
    if (userId) {
      const wishList = await this.wishListModel
        .findOne({ user: userId })
        .lean();

      if (wishList) {
        wishListProducts = wishList.products.map(p => p.toString());
      }
    }

    const enrichedProducts = populatedProducts.map(p => ({
      ...p,
      isWishListed: wishListProducts.includes(p._id.toString()),
    }));

    return {
      isSuccess: true,
      message: getMessage('products_productsRetrievedSuccessfully', lang),
      dataCount: enrichedProducts.length,
      data: enrichedProducts,
    };
  }

  async getOne(
    id: string,
    lang?: Locale,
    userId?: mongoose.Types.ObjectId,
  ): Promise<DataResponse<Product>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(
        getMessage('products_invalidProductId', lang),
      );
    }

    // 🔥 increment view BEFORE fetching
    await this.incrementView(id);

    const product = await this.productModel
      .findById(id)
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('unDeletedBy', 'firstName lastName email _id')
      .populate('createdBy', 'firstName lastName email _id')
      .lean();

    if (!product) {
      throw new NotFoundException(getMessage('products_productNotFound', lang));
    }

    // Enrich with isWishListed per user
    let isWishListed = false;
    if (userId) {
      const wishList = await this.wishListModel.findOne({
        user: userId,
        products: new Types.ObjectId(id),
      });

      isWishListed = !!wishList;
    }

    return {
      isSuccess: true,
      message: getMessage('products_productRetrievedSuccessfully', lang),
      data: {
        ...product,
        isWishListed,
      },
    };
  }

  async create(
    user: any,
    dto: CreateProductDto,
    mainImage: Express.Multer.File,
    images: Express.Multer.File[],
  ): Promise<DataResponse<Product>> {
    const {
      name_ar,
      name_en,
      description_ar,
      description_en,
      price,
      currency,
      discountRate = 0,
      totalAmountCount = 0,
      typeHint = [],
      categoryId,
      subCategoryId,
      tags = [],
      isAvailable = true,
      lang,
    } = dto;

    validateUserRoleAccess(user, lang);

    const rawTypeHint = typeHint;
    const typeHints: string[] = Array.isArray(rawTypeHint)
      ? rawTypeHint
      : rawTypeHint
        ? [rawTypeHint]
        : [];

    for (const th of typeHints) {
      if (SYSTEM_GENERATED_HINTS.includes(th as SystemTypeHints)) {
        throw new BadRequestException(
          getMessage('products_cannotAssignSystemGeneratedTypeHint', dto.lang),
        );
      }
    }

    const slug = slugify(name_en, { lower: true });

    const existing = await this.productModel.findOne({
      $or: [
        { 'name.ar': name_ar },
        { 'name.en': name_en },
        { 'description.ar': description_ar },
        { 'description.en': description_en },
        { slug },
      ],
    });

    if (existing) {
      throw new BadRequestException(
        getMessage('products_productWithThisNameOrDescAlreadyExist', lang),
      );
    }

    const category = await this.categoryModel.findById(categoryId).lean();

    if (!category) {
      throw new BadRequestException(
        getMessage('categories_categoryNotFound', lang),
      );
    }

    const subExists = (category?.subCategories || [])?.some(
      (subId: any) => subId.toString() === subCategoryId,
    );

    if (!subExists) {
      throw new BadRequestException(
        getMessage('products_subCategoryDoesNotBelongToCategory', lang),
      );
    }

    let imageUrls: string[] = [];
    let mediaListIds: string[] = [];
    let mainMediaId: string | undefined = undefined;
    let mainImageUrl: string | undefined;

    if (mainImage) {
      fileSizeValidator(mainImage, MEDIA_CONFIG.PRODUCT.IMAGE.MAX_SIZE, lang);
      fileTypeValidator(
        mainImage,
        MEDIA_CONFIG.PRODUCT.IMAGE.ALLOWED_TYPES,
        lang,
      );

      const mainUpload = await this.mediaService.handleFileUpload(
        mainImage,
        { userId: user?.userId },
        lang,
        Modules.PRODUCT,
      );
      if (mainUpload?.isSuccess) {
        mainImageUrl = mainUpload.fileUrl;
        mainMediaId = mainUpload.mediaId;
      }
    }

    if (Array.isArray(images) && images.length > 0) {
      for (const img of images) {
        fileSizeValidator(img, MEDIA_CONFIG.PRODUCT.IMAGE.MAX_SIZE, lang);
        fileTypeValidator(img, MEDIA_CONFIG.PRODUCT.IMAGE.ALLOWED_TYPES, lang);

        const upload = await this.mediaService.handleFileUpload(
          img,
          { userId: user?.userId },
          lang,
          Modules.PRODUCT,
        );

        if (upload?.isSuccess) {
          imageUrls.push(upload.fileUrl);
          mediaListIds.push(upload.mediaId);
        }
      }
    }

    const typeHintKeysResponse = await this.typeHintConfigService.getList(
      user,
      {
        lang: dto.lang,
      },
    );

    const allowedTypeHints = typeHintKeysResponse.data;

    const isValid = typeHints.every(th => allowedTypeHints.includes(th));

    if (!isValid) {
      throw new BadRequestException(
        getMessage('products_invalidTypeHint', lang),
      );
    }

    const product = new this.productModel({
      name: { ar: name_ar, en: name_en },
      description: { ar: description_ar, en: description_en },
      price,
      currency,
      discountRate,
      totalAmountCount,
      availableCount: totalAmountCount,
      sellCount: 0,
      favoriteCount: 0,
      typeHint: typeHints.length ? typeHints : [SystemTypeHints.STATIC],
      slug,
      tags,
      categoryId,
      subCategoryId,
      mainImage: mainImageUrl || imageUrls[0],
      mainMediaId: mainMediaId || mediaListIds[0],
      images: imageUrls,
      mediaListIds,
      isAvailable,
      isActive: true,
      isDeleted: false,
      createdBy: user?.userId,
    });

    await product.save();

    return {
      isSuccess: true,
      message: getMessage('products_productCreatedSuccessfully', lang),
      data: product,
    };
  }

  async update(
    id: string,
    user: any,
    body: UpdateProductBodyDto,
    mainImage?: Express.Multer.File,
    images?: Express.Multer.File[],
  ): Promise<DataResponse<Product>> {
    const {
      name_ar,
      name_en,
      description_ar,
      description_en,
      price,
      currency,
      discountRate,
      totalAmountCount,
      typeHint,
      categoryId,
      subCategoryId,
      tags,
      isAvailable,
      lang,
    } = body;

    validateUserRoleAccess(user, lang);

    // normalize typeHint
    const rawTypeHint = typeHint;
    const typeHints: string[] = Array.isArray(rawTypeHint)
      ? rawTypeHint
      : rawTypeHint
        ? [rawTypeHint]
        : [];

    for (const th of typeHints) {
      if (SYSTEM_GENERATED_HINTS.includes(th as SystemTypeHints)) {
        throw new BadRequestException(
          getMessage('products_cannotAssignSystemGeneratedTypeHint', lang),
        );
      }
    }

    const product = await this.productModel.findById(id);
    if (!product) {
      throw new BadRequestException(
        getMessage('products_productNotFound', lang),
      );
    }

    // Check for slug uniqueness if name_en is being updated
    let slug = product.slug;
    if (name_en) {
      slug = slugify(name_en, { lower: true });
    }

    // Check for conflicts with name, description, and slug
    if (name_ar || name_en || description_ar || description_en) {
      const conflictQuery: any = {
        _id: { $ne: id },
        $or: [],
      };

      if (name_ar) conflictQuery.$or.push({ 'name.ar': name_ar });
      if (name_en) {
        conflictQuery.$or.push({ 'name.en': name_en });
        conflictQuery.$or.push({ slug }); // Also check for slug conflict
      }
      if (description_ar)
        conflictQuery.$or.push({ 'description.ar': description_ar });
      if (description_en)
        conflictQuery.$or.push({ 'description.en': description_en });

      const conflict = await this.productModel.findOne(conflictQuery);

      if (conflict) {
        throw new BadRequestException(
          getMessage('products_productWithThisNameOrDescAlreadyExist', lang),
        );
      }
    }

    // Update product fields
    if (name_ar) product.name.ar = name_ar;
    if (name_en) {
      product.name.en = name_en;
      product.slug = slug;
    }
    if (description_ar) product.description.ar = description_ar;
    if (description_en) product.description.en = description_en;
    if (price !== undefined) product.price = Number(price);
    if (currency) product.currency = currency;
    if (discountRate !== undefined) product.discountRate = Number(discountRate);
    if (totalAmountCount !== undefined) {
      product.totalAmountCount = Number(totalAmountCount);
      product.availableCount = Number(totalAmountCount);
    }

    if (rawTypeHint !== undefined) {
      const typeHintKeysResponse = await this.typeHintConfigService.getList(
        user,
        {
          lang,
        },
      );

      const allowedTypeHints = typeHintKeysResponse.data;

      const isValid = typeHints.every(th => allowedTypeHints.includes(th));

      if (!isValid) {
        throw new BadRequestException(
          getMessage('products_invalidTypeHint', lang),
        );
      }

      product.typeHint = typeHints.length
        ? typeHints
        : [SystemTypeHints.STATIC];
    }

    // Handle ObjectId assignments - use direct assignment, Mongoose will handle conversion
    if (categoryId) product.categoryId = categoryId as any;
    if (subCategoryId) product.subCategoryId = subCategoryId as any;

    if (Array.isArray(tags)) product.tags = tags;
    if (isAvailable !== undefined) product.isAvailable = isAvailable;

    // Update metadata
    product.updatedBy = user?.userId;
    product.updatedAt = new Date();

    // Handle main image upload
    if (mainImage) {
      fileSizeValidator(mainImage, MEDIA_CONFIG.PRODUCT.IMAGE.MAX_SIZE, lang);
      fileTypeValidator(
        mainImage,
        MEDIA_CONFIG.PRODUCT.IMAGE.ALLOWED_TYPES,
        lang,
      );

      const mainUpload = await this.mediaService.handleFileUpload(
        mainImage,
        { userId: user?.userId },
        lang,
        Modules.PRODUCT,
      );
      if (mainUpload?.isSuccess) {
        product.mainImage = mainUpload.fileUrl;
        product.mainMediaId = mainUpload.mediaId;
      }
    }

    // Handle multiple images upload
    if (images?.length) {
      const newImageUrls: string[] = [];
      const newMediaListIds: string[] = [];

      for (const img of images) {
        fileSizeValidator(img, MEDIA_CONFIG.PRODUCT.IMAGE.MAX_SIZE, lang);
        fileTypeValidator(img, MEDIA_CONFIG.PRODUCT.IMAGE.ALLOWED_TYPES, lang);

        const upload = await this.mediaService.handleFileUpload(
          img,
          { userId: user?.userId },
          lang,
          Modules.PRODUCT,
        );

        if (upload?.isSuccess) {
          newImageUrls.push(upload.fileUrl);
          newMediaListIds.push(upload.mediaId);
        }
      }

      product.images = [...(product.images || []), ...newImageUrls];
      product.mediaListIds = [
        ...(product.mediaListIds || []),
        ...newMediaListIds,
      ];
    }

    await product.save();

    return {
      isSuccess: true,
      message: getMessage('products_productUpdatedSuccessfully', lang),
      data: product,
    };
  }

  async updateStatus(
    id: string,
    isActive: boolean,
    lang: Locale = 'en',
    requestingUser: any,
  ): Promise<BaseResponse> {
    validateUserRoleAccess(requestingUser, lang);

    const product = await this.productModel.findById(id);

    if (!product) {
      throw new NotFoundException(getMessage('products_productNotFound', lang));
    }

    if (isActive) {
      // ✅ 1. CHECK PARENT TYPE HINT STATUS
      const typeHintConfig = await this.typeHintConfigModel.findOne({
        key: product.typeHint,
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

      // Check sub-category
      const subCategory = await this.subCategoryModel.findById(
        product.subCategoryId,
        { isActive: 1, categoryId: 1 },
      );

      if (!subCategory || !subCategory.isActive) {
        throw new BadRequestException(
          getMessage('products_cannotActivateSubCategoryIsInactive', lang),
        );
      }

      // Check category
      const category = await this.categoryModel.findById(
        subCategory.categoryId,
        { isActive: 1 },
      );

      if (!category || !category.isActive) {
        throw new BadRequestException(
          getMessage('products_cannotActivateCategoryIsInactive', lang),
        );
      }

      product.isDeleted = false;
      product.deletedAt = null;
    }

    product.isActive = isActive;

    await product.save();

    return {
      isSuccess: true,
      message: getMessage(
        isActive
          ? 'products_productActivatedSuccessfully'
          : 'products_productDeactivatedSuccessfully',
        lang,
      ),
    };
  }

  async delete(
    requestingUser: any,
    body: DeleteProductDto,
    id: string,
  ): Promise<BaseResponse> {
    const { lang } = body;

    validateUserRoleAccess(requestingUser, lang);

    const product = await this.productModel.findById(id);

    if (!product) {
      throw new BadRequestException(
        getMessage('products_productNotFound', lang),
      );
    }

    product.isDeleted = true;
    product.isActive = false;
    product.deletedAt = new Date();
    product.deletedBy = requestingUser.userId;
    product.unDeletedBy = null;

    await product.save();

    return {
      isSuccess: true,
      message: getMessage('products_productDeletedSuccessfully', lang),
    };
  }

  async unDelete(
    requestingUser: any,
    body: UnDeleteProductBodyDto,
    id: string,
  ): Promise<BaseResponse> {
    const { lang } = body;

    validateUserRoleAccess(requestingUser, lang);

    const product = await this.productModel.findById(id);

    if (!product) {
      throw new BadRequestException(
        getMessage('products_productNotFound', lang),
      );
    }

    product.isDeleted = false;
    product.deletedAt = null;
    product.deletedBy = null;
    product.unDeletedBy = requestingUser.userId;
    product.unDeletedAt = new Date();

    await product.save();

    return {
      isSuccess: true,
      message: getMessage('products_productUnDeletedSuccessfully', lang),
    };
  }

  async deactivateBySubCategory(
    subCategoryId: string,
    requestingUser: any,
  ): Promise<void> {
    await this.productModel.updateMany(
      {
        subCategoryId: new Types.ObjectId(subCategoryId),
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

  async deactivateBySubCategories(
    subCategoryIds: Types.ObjectId[],
    requestingUser: any,
  ): Promise<void> {
    await this.productModel.updateMany(
      {
        subCategoryId: { $in: subCategoryIds },
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

  async deactivateByTypeHint(
    typeHint: string,
    requestingUser: any,
  ): Promise<void> {
    await this.productModel.updateMany(
      {
        typeHint,
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
