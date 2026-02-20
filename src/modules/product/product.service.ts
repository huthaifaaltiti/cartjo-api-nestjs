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
import { Locale } from 'src/types/Locale';
import { Category, CategoryDocument } from 'src/schemas/category.schema';
import { Modules } from 'src/enums/appModules.enum';
import { MediaService } from '../media/media.service';
import { TypeHintConfigService } from '../typeHintConfig/typeHintConfig.service';
import { validateUserRoleAccess } from 'src/common/utils/validateUserRoleAccess';
import { getMessage } from 'src/common/utils/translator';
import { WishList, WishListDocument } from 'src/schemas/wishList.schema';
import { GetProductsQueryDto } from './dto/get-products.dto';
import { MEDIA_CONFIG } from 'src/configs/media.config';
import { SystemTypeHints } from 'src/enums/systemTypeHints.enum';
import { Cron } from '@nestjs/schedule';
import { WEEKLY_SCORE_WEIGHTS } from 'src/configs/weeklyScoreWeights.config';
import { CRON_JOBS } from 'src/configs/cron.config';
import {
  SYSTEM_GENERATED_HINTS,
  SystemGeneratedHint,
} from 'src/configs/typeHint.config';
import { Currency } from 'src/enums/currency.enum';
import generateSKU from 'src/common/utils/generateSKU.util';
import { ProductVariantAttributeKey } from 'src/enums/productVariantAttributeKey.enum';
import {
  UpdateProductBodyDto,
  UpdateProductVariantParamsDto,
  UpdateProductVariantBodyDto,
} from './dto/update-product.dto';
import { generateSecureStamp } from 'src/common/utils/generateSecureStamp.util';
import {
  TypeHintConfig,
  TypeHintConfigDocument,
} from 'src/schemas/typeHintConfig.schema';
import {
  SubCategory,
  SubCategoryDocument,
} from 'src/schemas/subCategory.schema';
import { UpdateProductStatusBodyDto } from './dto/update-product-status.dto';
import { DeleteProductDto } from './dto/delete-product.dto';
import { UnDeleteProductBodyDto } from './dto/unDelete-product.dto';

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
      .lean();

    console.log({ products: products[0].variants });

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
      mainProductId?: string;
    },
    userId?: mongoose.Types.ObjectId,
  ) {
    const {
      lang = 'en',
      limit = 10,
      mainProductId,
      categoryId,
      subCategoryId,
    } = params;

    const productsQuery: any = {
      isActive: true,
      isDeleted: false,
    };

    if (mainProductId) {
      productsQuery._id = { $ne: new Types.ObjectId(mainProductId) };
    }

    if (categoryId) {
      productsQuery.categoryId = new Types.ObjectId(categoryId);
    }

    if (subCategoryId) {
      productsQuery.subCategoryId = new Types.ObjectId(subCategoryId);
    }

    const r = Math.random();
    let products = await this.productModel
      .find({
        ...productsQuery,
        random: { $gte: r },
      })
      .sort({ random: 1 })
      .limit(Number(limit))
      .lean();

    if (products.length < Number(limit)) {
      const more = await this.productModel
        .find({
          ...productsQuery,
          random: { $lt: r },
          _id: { $nin: products.map(p => p._id) },
        })
        .sort({ random: 1 })
        .limit(Number(limit) - products.length)
        .lean();

      products.push(...more);
    }

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
    req: any,
    dto: CreateProductDto,
    mainImage: Express.Multer.File,
    variantImages: Record<number, Express.Multer.File[]>,
    variantMainImages: Record<number, Express.Multer.File>,
  ): Promise<DataResponse<Product>> {
    const {
      name_ar,
      name_en,
      description_ar,
      description_en,
      categoryId,
      subCategoryId,
      variants,
      typeHints,
      tags = [],
      lang,
    } = dto;

    validateUserRoleAccess(req?.user, lang);

    // TypeHints check
    const rawTypeHints: string[] = Array.isArray(typeHints)
      ? typeHints
      : typeHints
        ? [typeHints]
        : [];

    for (const th of rawTypeHints) {
      if (SYSTEM_GENERATED_HINTS.includes(th as SystemTypeHints)) {
        throw new BadRequestException(
          getMessage('products_cannotAssignSystemGeneratedTypeHint', dto.lang),
        );
      }
    }

    // Slug uniqueness
    const slug = slugify(name_en, { lower: true });
    const newArDescriptions = variants.map(v => v.description_ar);
    const newEnDescriptions = variants.map(v => v.description_en);

    const [existingProduct, category, typeHintKeysResponse] = await Promise.all(
      [
        this.productModel.findOne({
          $or: [
            { 'name.ar': name_ar },
            { 'name.en': name_en },
            { 'description.ar': description_ar },
            { 'description.en': description_en },
            { 'variants.description.ar': { $in: newArDescriptions } },
            { 'variants.description.en': { $in: newEnDescriptions } },
            { slug },
          ],
        }),
        this.categoryModel.findById(categoryId).lean(),
        this.typeHintConfigService.getList(req?.user, {
          lang: dto.lang,
        }),
      ],
    );

    const allowedTypeHints = typeHintKeysResponse.data;
    const isValid = typeHints.every(th => allowedTypeHints.includes(th));
    if (!isValid) {
      throw new BadRequestException(
        getMessage('products_invalidTypeHint', lang),
      );
    }

    if (existingProduct) {
      throw new BadRequestException(
        getMessage('products_productWithThisNameOrDescAlreadyExist', lang),
      );
    }

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

    let mainImageObject: { id: string; url: string } = { id: null, url: null };
    if (mainImage) {
      const mainUpload = await this.mediaService.mediaProcessor({
        file: mainImage,
        user: req?.user,
        reqMsg: 'products_productShouldHasMainImage',
        maxSize: MEDIA_CONFIG.PRODUCT.IMAGE.MAX_SIZE,
        allowedTypes: MEDIA_CONFIG.PRODUCT.IMAGE.ALLOWED_TYPES,
        lang,
        key: Modules.PRODUCT,
        req,
      });

      if (mainUpload) {
        mainImageObject = { id: mainUpload.id, url: mainUpload.url };
      }
    }

    // variants
    for (const variant of variants) {
      const hasSellingType = variant.attributes.some(
        attr => attr.key === ProductVariantAttributeKey.SELLING_TYPE,
      );

      if (!hasSellingType) {
        throw new BadRequestException(
          getMessage('products_mustSellingType', lang),
        );
      }
    }

    // Process Variants
    const processedVariants = await Promise.all(
      variants.map(async (v, index) => {
        const variantSKU = generateSKU({
          productSlug: slug,
          attributes: v.attributes,
        });

        const variantFiles = variantImages[index] || [];
        const variantMainFile = variantMainImages[index];

        let variantMainImage = { id: null, url: null };

        if (Number(v.availableCount) > Number(v.totalAmountCount)) {
          throw new BadRequestException(
            getMessage('products_availableCountExceedsTotalAmountCount', lang),
          );
        }

        if (variantMainFile) {
          const mainUpload = await this.mediaService.mediaProcessor({
            file: variantMainFile,
            user: req?.user,
            reqMsg: 'products_variantShouldHasMainImage',
            maxSize: MEDIA_CONFIG.PRODUCT.IMAGE.MAX_SIZE,
            allowedTypes: MEDIA_CONFIG.PRODUCT.IMAGE.ALLOWED_TYPES,
            lang,
            key: `${Modules.PRODUCT}/Variant`,
            req,
          });

          if (mainUpload) {
            variantMainImage = { id: mainUpload.id, url: mainUpload.url };
          }
        }

        const uploadedImages = await Promise.all(
          variantFiles.map(file =>
            this.mediaService.mediaProcessor({
              file,
              user: req.user,
              reqMsg: 'products_variantShouldHasImage',
              maxSize: MEDIA_CONFIG.PRODUCT.IMAGE.MAX_SIZE,
              allowedTypes: MEDIA_CONFIG.PRODUCT.IMAGE.ALLOWED_TYPES,
              lang,
              key: `${Modules.PRODUCT}/Variant`,
              req,
            }),
          ),
        );

        return {
          variantId: generateSecureStamp(),
          sku: variantSKU,
          attributes: v.attributes,
          description: {
            ar: v.description_ar,
            en: v.description_en,
          },
          mainImage: variantMainImage,
          images: uploadedImages,
          price: Number(v.price),
          currency: v.currency || Currency.JOD,
          availableCount: Number(v.totalAmountCount),
          totalAmountCount: Number(v.totalAmountCount),
          isActive: true,
          isAvailable: true,
          createdAt: new Date(),
          createdBy: req?.user?.userId,
        };
      }),
    );

    const product = new this.productModel({
      name: { ar: name_ar, en: name_en },
      description: { ar: description_ar, en: description_en },
      slug,
      tags,
      categoryId,
      subCategoryId,
      mainImage: mainImageObject,
      variants: processedVariants,
      typeHint: rawTypeHints.length ? rawTypeHints : [SystemTypeHints.STATIC],
      createdBy: req?.user?.userId,
      createdAt: new Date(),
    });

    await product.save();

    return {
      isSuccess: true,
      message: getMessage('products_productCreatedSuccessfully', lang),
      data: product,
    };
  }

  async update(
    id: mongoose.Types.ObjectId,
    req: any,
    body: UpdateProductBodyDto,
    mainImage?: Express.Multer.File,
  ): Promise<DataResponse<Product>> {
    const {
      name_ar,
      name_en,
      description_ar,
      description_en,
      categoryId,
      subCategoryId,
      typeHints,
      lang,
    } = body;

    validateUserRoleAccess(req?.user, lang);

    // Product check
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new BadRequestException(
        getMessage('products_productNotFound', lang),
      );
    }

    // Final Category/SubCategory
    const finalCategoryId = categoryId ?? product.categoryId;
    const finalSubCategoryId = subCategoryId ?? product.subCategoryId;

    if (categoryId || subCategoryId) {
      const category = await this.categoryModel
        .findById(finalCategoryId)
        .lean();
      if (!category) {
        throw new BadRequestException(
          getMessage('categories_categoryNotFound', lang),
        );
      }

      const subExists = (category.subCategories || []).some(
        (subId: any) => subId.toString() === finalSubCategoryId?.toString(),
      );

      if (!subExists) {
        throw new BadRequestException(
          getMessage('products_subCategoryDoesNotBelongToCategory', lang),
        );
      }
    }

    // Check slug uniqueness
    let slug = product.slug;

    if (name_en) {
      slug = slugify(name_en, { lower: true, strict: true });
    }

    // Check conflicts with name, description, and slug
    if (name_ar || name_en || description_ar || description_en) {
      const conflictQuery: any = {
        _id: { $ne: id },
        categoryId: finalCategoryId,
        subCategoryId: finalSubCategoryId,
        $or: [],
      };

      if (name_ar) conflictQuery.$or.push({ 'name.ar': name_ar });
      if (name_en) {
        conflictQuery.$or.push({ 'name.en': name_en });
        conflictQuery.$or.push({ slug });
      }
      if (description_ar)
        conflictQuery.$or.push({ 'description.ar': description_ar });
      if (description_en)
        conflictQuery.$or.push({ 'description.en': description_en });

      if (conflictQuery.$or.length) {
        const conflict = await this.productModel.findOne(conflictQuery);
        if (conflict) {
          throw new BadRequestException(
            getMessage('products_productWithThisNameOrDescAlreadyExist', lang),
          );
        }
      }
    }

    // TypeHints check
    if (typeHints !== undefined) {
      const rawTypeHints: string[] = Array.isArray(typeHints)
        ? typeHints
        : typeHints
          ? [typeHints]
          : [];
      const productTypeHints = product.typeHints;

      for (const th of rawTypeHints) {
        if (SYSTEM_GENERATED_HINTS.includes(th as SystemTypeHints)) {
          throw new BadRequestException(
            getMessage('products_cannotAssignSystemGeneratedTypeHint', lang),
          );
        }

        if (productTypeHints.includes(th)) {
          throw new BadRequestException(
            getMessage('products_alreadyUsedTypeHint', lang),
          );
        }
      }

      const typeHintKeysRes = await this.typeHintConfigService.getList(
        req?.user,
        {
          lang,
        },
      );

      const allowedTypeHints = typeHintKeysRes.data;

      const isValid = typeHints.every(th => allowedTypeHints.includes(th));

      if (!isValid) {
        throw new BadRequestException(
          getMessage('products_invalidTypeHint', lang),
        );
      }

      product.typeHints =
        typeHints.length > 0 ? rawTypeHints : [SystemTypeHints.STATIC];
    }

    // Update product fields
    if (name_ar) product.name.ar = name_ar;
    if (name_en) {
      product.name.en = name_en;
      product.slug = slug;
    }
    if (description_ar) product.description.ar = description_ar;
    if (description_en) product.description.en = description_en;

    // Handle ObjectId assignments - use direct assignment, Mongoose will handle conversion
    if (categoryId) product.categoryId = finalCategoryId as any;
    if (subCategoryId) product.subCategoryId = finalSubCategoryId as any;

    // Handle main image upload
    if (mainImage) {
      const mainUpload = await this.mediaService.hardDeleteAndUpload({
        file: mainImage,
        user: req?.user,
        reqMsg: 'products_productShouldHasMainImage',
        maxSize: MEDIA_CONFIG.PRODUCT.IMAGE.MAX_SIZE,
        allowedTypes: MEDIA_CONFIG.CATEGORY.IMAGE.ALLOWED_TYPES,
        lang,
        key: Modules.PRODUCT,
        req,
        existingMediaId: product.mainImage.id?.toString(),
      });

      if (mainUpload) {
        product.mainImage = {
          url: mainUpload.url,
          id: new Types.ObjectId(mainUpload.id) as any,
        };
      }
    }

    // Update metadata
    product.updatedBy = req?.user?.userId;
    product.updatedAt = new Date();

    await product.save();

    return {
      isSuccess: true,
      message: getMessage('products_productUpdatedSuccessfully', lang),
      data: product,
    };
  }

  async updateVariant(
    param: UpdateProductVariantParamsDto,
    req: any,
    body: UpdateProductVariantBodyDto,
    mainImage?: Express.Multer.File,
    imagesFiles?: Express.Multer.File[],
  ) {
    const { id: productId, vid: variantId } = param;
    const {
      attributes,
      description_ar,
      description_en,
      price,
      currency,
      totalAmountCount,
      availableCount,
      discountRate,
      tags,
      lang,
      deletedImages,
    } = body;

    validateUserRoleAccess(req?.user, lang);

    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new BadRequestException(
        getMessage('products_productNotFound', lang),
      );
    }

    // Find the variant
    const variantIndex = product.variants.findIndex(
      v => v.variantId === variantId,
    );

    if (variantIndex === -1) {
      throw new BadRequestException(
        getMessage('products_variantNotFound', lang),
      );
    }

    const variant = { ...product.variants[variantIndex] };

    if (!variant) {
      throw new BadRequestException(
        getMessage('products_variantNotFound', body.lang),
      );
    }

    const finalDescriptionAr = description_ar ?? variant.description.ar;
    const finalDescriptionEn = description_en ?? variant.description.en;
    const isDuplicate = product.variants.some(
      (v, index) =>
        index !== variantIndex &&
        (v.description.ar === finalDescriptionAr ||
          v.description.en === finalDescriptionEn),
    );

    if (isDuplicate) {
      throw new BadRequestException(
        getMessage('products_variantDescriptionAlreadyExists', lang),
      );
    }

    // Update basic fields
    if (description_ar) variant.description.ar = description_ar;
    if (description_en) variant.description.en = description_en;
    if (price !== undefined) variant.price = price;
    if (currency) variant.currency = currency;
    if (totalAmountCount !== undefined)
      variant.totalAmountCount = totalAmountCount;
    if (discountRate !== undefined) variant.discountRate = discountRate;
    if (availableCount !== undefined) variant.availableCount = availableCount;
    // if (isActive !== undefined) variant.isActive = isActive;
    // if (isAvailable !== undefined) variant.isAvailable = isAvailable;
    if (tags) variant.tags = [...tags];

    if (attributes.length) {
      const hasSellingType = attributes.some(
        attr => attr.key === ProductVariantAttributeKey.SELLING_TYPE,
      );

      if (!hasSellingType) {
        throw new BadRequestException(
          getMessage('products_mustSellingType', lang),
        );
      }

      variant.attributes = [...attributes];
    }

    if (mainImage) {
      const mainUpload = await this.mediaService.hardDeleteAndUpload({
        file: mainImage,
        user: req.user,
        reqMsg: 'products_variantShouldHasMainImage',
        maxSize: MEDIA_CONFIG.PRODUCT.IMAGE.MAX_SIZE,
        allowedTypes: MEDIA_CONFIG.PRODUCT.IMAGE.ALLOWED_TYPES,
        lang: body.lang,
        key: `${Modules.PRODUCT}/Variant`,
        req,
        existingMediaId: variant.mainImage?.id?.toString(),
      });

      if (mainUpload) {
        variant.mainImage = {
          id: new Types.ObjectId(mainUpload.id) as any,
          url: mainUpload.url,
        };
      }
    }

    // Handle Deleted Images
    if (deletedImages && Array.isArray(deletedImages) && imagesFiles?.length) {
      for (const urlToDelete of deletedImages) {
        const itemToDelete = variant.images.find(i => i.url === urlToDelete);
        const index = variant.images.indexOf(itemToDelete);

        if (index > -1) {
          await this.mediaService.deleteByUrl(urlToDelete);
          variant.images.splice(index, 1);
        }
      }

      // Upload additional images if provided
      if (imagesFiles?.length) {
        const uploadedImages = await Promise.all(
          imagesFiles.map(file =>
            this.mediaService.mediaProcessor({
              file,
              user: req.user,
              reqMsg: 'products_variantShouldHasImage',
              maxSize: MEDIA_CONFIG.PRODUCT.IMAGE.MAX_SIZE,
              allowedTypes: MEDIA_CONFIG.PRODUCT.IMAGE.ALLOWED_TYPES,
              lang: body.lang,
              key: `${Modules.PRODUCT}/Variant`,
              req,
            }),
          ),
        );

        variant.images = [...variant.images, ...uploadedImages];
      }
    }

    variant.updatedBy = req.user.userId;
    variant.updatedAt = new Date();

    product.variants[variantIndex] = variant;
    product.markModified('variants');

    product.updatedBy = req.user.userId;
    product.updatedAt = new Date();

    await product.save();

    return {
      isSuccess: true,
      message: getMessage('products_variantUpdatedSuccessfully', body.lang),
      data: variant,
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
      // Check active type-hints
      if (product.typeHints?.length) {
        const activeTypeHints = await this.typeHintConfigModel.find({
          key: { $in: product.typeHints },
          isDeleted: false,
          isActive: true,
        });

        if (activeTypeHints.length !== product.typeHints.length) {
          throw new BadRequestException(
            getMessage('showcase_typeHintKeyNotActive', lang),
          );
        }
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

  async updateVariantStatus(
    body: UpdateProductStatusBodyDto,
    param: UpdateProductVariantParamsDto,
    requestingUser: any,
  ): Promise<BaseResponse> {
    const { isActive, lang } = body;
    const { id, vid } = param;

    validateUserRoleAccess(requestingUser, lang);

    const product = await this.productModel.findById(id);

    if (!product)
      throw new NotFoundException(getMessage('products_productNotFound', lang));

    // Find the variant
    const variantIndex = product.variants.findIndex(v => v.variantId === vid);

    if (variantIndex === -1) {
      throw new BadRequestException(
        getMessage('products_variantNotFound', lang),
      );
    }

    if (isActive) {
      if (!product.isActive) {
        throw new BadRequestException(
          getMessage('product_cantActivateVariantDeactivatedProduct', lang),
        );
      }

      // Validate typeHints
      if (product.typeHints?.length) {
        const activeTypeHints = await this.typeHintConfigModel.find({
          key: { $in: product.typeHints },
          isDeleted: false,
          isActive: true,
        });

        if (activeTypeHints.length !== product.typeHints.length) {
          throw new BadRequestException(
            getMessage('showcase_typeHintKeyNotActive', lang),
          );
        }
      }

      // Validate subCategory
      const subCategory = await this.subCategoryModel
        .findById(product.subCategoryId, {
          isActive: 1,
          categoryId: 1,
        })
        .lean();

      if (!subCategory || !subCategory.isActive) {
        throw new BadRequestException(
          getMessage('products_cannotActivateSubCategoryIsInactive', lang),
        );
      }

      // Validate category
      const category = await this.categoryModel
        .findById(subCategory.categoryId, { isActive: 1 })
        .lean();

      if (!category || !category.isActive) {
        throw new BadRequestException(
          getMessage('products_cannotActivateCategoryIsInactive', lang),
        );
      }
    }

    product.variants[variantIndex].isActive = isActive;
    product.markModified('variants');

    // Auto product deactivation/activation logic
    const hasActiveVariant = product.variants.some(v => v.isActive);
    if (!hasActiveVariant) {
      product.isActive = false;
    }

    if (isActive && !product.isActive) {
      throw new BadRequestException(
        getMessage('product_cantActivateVariantDeactivatedProduct', lang),
      );
    }

    product.updatedBy = requestingUser?.userId;
    product.updatedAt = new Date();

    await product.save();

    return {
      isSuccess: true,
      message: getMessage(
        isActive
          ? 'products_variantActivatedSuccessfully'
          : 'products_variantDeactivatedSuccessfully',
        lang,
      ),
    };
  }

  async deleteProduct(
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

  async deleteVariant(
    param: UpdateProductVariantParamsDto,
    body: DeleteProductDto,
    requestingUser: any,
  ): Promise<BaseResponse> {
    const { id, vid } = param;
    const { lang } = body;

    validateUserRoleAccess(requestingUser, lang);

    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException(getMessage('products_productNotFound', lang));
    }

    const variantIndex = product.variants.findIndex(v => v.variantId === vid);

    if (variantIndex === -1) {
      throw new BadRequestException(
        getMessage('products_variantNotFound', lang),
      );
    }

    const variant = product.variants[variantIndex];

    if (variant.isDeleted) {
      throw new BadRequestException(
        getMessage('products_variantAlreadyDeleted', lang),
      );
    }

    variant.isDeleted = true;
    variant.isActive = false;
    variant.deletedAt = new Date();
    variant.deletedBy = requestingUser?.userId;

    product.markModified('variants');

    // Auto deactivate product if no active variants left
    const hasActiveVariant = product.variants.some(
      v => v.isActive && !v.isDeleted,
    );

    if (!hasActiveVariant) {
      product.isActive = false;
    }

    await product.save();

    return {
      isSuccess: true,
      message: getMessage('products_variantDeletedSuccessfully', lang),
    };
  }

  async unDeleteProduct(
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

  async unDeleteVariant(
    param: UpdateProductVariantParamsDto,
    body: UnDeleteProductBodyDto,
    requestingUser: any,
  ): Promise<BaseResponse> {
    const { id, vid } = param;
    const { lang } = body;

    validateUserRoleAccess(requestingUser, lang);

    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException(getMessage('products_productNotFound', lang));
    }

    if (!product.isActive) {
      throw new BadRequestException(
        getMessage('product_cantActivateVariantDeactivatedProduct', lang),
      );
    }

    const variantIndex = product.variants.findIndex(v => v.variantId === vid);

    if (variantIndex === -1) {
      throw new BadRequestException(
        getMessage('products_variantNotFound', lang),
      );
    }

    const variant = product.variants[variantIndex];

    if (!variant.isDeleted) {
      throw new BadRequestException(
        getMessage('products_variantNotDeleted', lang),
      );
    }

    variant.isDeleted = false;
    variant.isActive = true;
    variant.unDeletedAt = new Date();
    variant.unDeletedBy = requestingUser?.userId;

    product.markModified('variants');

    await product.save();

    return {
      isSuccess: true,
      message: getMessage('products_variantRestoredSuccessfully', lang),
    };
  }
}
