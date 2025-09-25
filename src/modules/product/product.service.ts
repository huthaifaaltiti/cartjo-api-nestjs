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
import { MAX_FILE_SIZES } from 'src/common/utils/file-size.config';
import { WishList, WishListDocument } from 'src/schemas/wishList.schema';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
    private mediaService: MediaService,

    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,

    @InjectModel(WishList.name)
    private wishListModel: Model<WishListDocument>,

    private typeHintConfigService: TypeHintConfigService,
  ) {}

  async getAll(
    params: {
      lang?: Locale;
      limit?: string;
      lastId?: string;
      search?: string;
      categoryId?: string;
      subCategoryId?: string;
      priceFrom?: string;
      priceTo?: string;
      ratingFrom?: string;
      ratingTo?: string;
      createdFrom?: string;
      createdTo?: string;
      beforeNumOfDays?: string;
    },
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
    } = params;

    const query: any = {};

    if (lastId) {
      query._id = { $lt: new Types.ObjectId(lastId) };
    }

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

    const products = await this.productModel
      .find(query)
      .sort({ _id: -1 }) // Sorting by .sort({ createdAt: -1 }) ensures most recent products appear first.
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
      throw new NotFoundException(
        getMessage('products_productsNotFound', lang),
      );
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

  // async getOne(
  //   id: string,
  //   lang?: Locale,
  //   userId?: mongoose.Types.ObjectId,
  // ): Promise<DataResponse<Product>> {
  //   try {
  //     if (!Types.ObjectId.isValid(id)) {
  //       return {
  //         isSuccess: false,
  //         message: getMessage('products_invalidProductId', lang),
  //         data: null,
  //         error: {
  //           code: ItemErrorCode.INVALID_ID,
  //           details: getMessage('products_invalidProductId', lang),
  //         },
  //       };
  //     }

  //     const product = await this.productModel
  //       .findById(id)
  //       .populate('deletedBy', 'firstName lastName email _id')
  //       .populate('unDeletedBy', 'firstName lastName email _id')
  //       .populate('createdBy', 'firstName lastName email _id')
  //       .lean();

  //     if (!product) {
  //       return {
  //         isSuccess: false,
  //         message: getMessage('products_productNotFound', lang),
  //         data: null,
  //         error: {
  //           code: ItemErrorCode.NOT_FOUND,
  //           details: getMessage('products_productNotFound', lang),
  //         },
  //       };
  //     }

  //     // Enrich with isWishListed per user
  //     let isWishListed = false;
  //     if (userId) {
  //       const wishList = await this.wishListModel.findOne({
  //         user: userId,
  //         products: new Types.ObjectId(id),
  //       });

  //       isWishListed = !!wishList;
  //     }

  //     return {
  //       isSuccess: true,
  //       message: getMessage('products_productRetrievedSuccessfully', lang),
  //       error: null,
  //       data: {
  //         ...product,
  //         isWishListed,
  //       },
  //     };
  //   } catch (error) {
  //     return {
  //       isSuccess: false,
  //       message: getMessage('general_databaseError', lang),
  //       data: null,
  //       error: {
  //         code: GeneralErrorCode.DATABASE_ERROR,
  //         details:
  //           error instanceof Error
  //             ? error.message
  //             : getMessage('general_unknownDatabaseError', lang),
  //       },
  //     };
  //   }
  // }

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
      typeHint,
      categoryId,
      subCategoryId,
      tags = [],
      isAvailable = true,
      lang,
    } = dto;

    validateUserRoleAccess(user, lang);

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
      fileSizeValidator(mainImage, MAX_FILE_SIZES.PRODUCT_IMAGE, lang);

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

    for (const img of images) {
      fileSizeValidator(img, MAX_FILE_SIZES.PRODUCT_IMAGE, lang);

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

    const typeHintKeys = await this.typeHintConfigService.getList(user, {
      lang: dto.lang,
    });

    if (!typeHintKeys.data.includes(typeHint)) {
      throw new BadRequestException(
        getMessage('products_invalidTypeHint', dto.lang),
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
      typeHint,
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
    if (typeHint) {
      const typeHintKeys = await this.typeHintConfigService.getList(user, {
        lang,
      });

      if (!typeHintKeys.data.includes(typeHint)) {
        throw new BadRequestException(
          getMessage('products_invalidTypeHint', lang),
        );
      }

      product.typeHint = typeHint;
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
      fileSizeValidator(mainImage, MAX_FILE_SIZES.PRODUCT_IMAGE, lang);

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
        fileSizeValidator(img, MAX_FILE_SIZES.PRODUCT_IMAGE, lang);

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
}
