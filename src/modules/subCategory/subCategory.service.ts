import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { validateUserRoleAccess } from 'src/common/utils/validateUserRoleAccess';
import { getMessage } from 'src/common/utils/translator';
import { MediaService } from '../media/media.service';
import {
  SubCategory,
  SubCategoryDocument,
} from 'src/schemas/subCategory.schema';
import {
  BaseResponse,
  DataListResponse,
  DataResponse,
} from 'src/types/service-response.type';
import { Locale } from 'src/types/Locale';
import { Category, CategoryDocument } from 'src/schemas/category.schema';
import { Modules } from 'src/enums/appModules.enum';
import { CreateSubCategoryDto } from './dto/create-subCategory.dto';
import { UpdateSubCategoryDto } from './dto/update-subCategory.dto';
import { DeleteSubCategoryDto } from './dto/delete-subCategory.dto';
import { UnDeleteSubCategoryBodyDto } from './dto/unDelete-subCategory.dto';
import { MediaPreview } from 'src/schemas/common.schema';
import slugify from 'slugify';
import { revalidateTag } from 'src/common/utils/revalidate';
import { REVALIDATION_TAGS } from 'src/common/constants/revalidation-tags';
import { RevalidationService } from '../revalidation/revalidation.service';
import { MEDIA_CONFIG } from 'src/configs/media.config';
import { ProductService } from '../product/product.service';

@Injectable()
export class SubCategoryService {
  constructor(
    @InjectModel(SubCategory.name)
    private subCategoryModel: Model<SubCategoryDocument>,
    private mediaService: MediaService,
    @Inject(forwardRef(() => ProductService))
    private productService: ProductService,
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
    private revalidationService: RevalidationService,
  ) {}

  async create(
    req: any,
    dto: CreateSubCategoryDto,
    image_ar: Express.Multer.File,
    image_en: Express.Multer.File,
  ): Promise<DataResponse<SubCategory>> {
    const { lang, name_ar, name_en, categoryId } = dto;

    validateUserRoleAccess(req?.user, lang);

    const slug = name_en ? slugify(name_en, { lower: true }) : undefined;

    const category = await this.categoryModel.findById(categoryId);

    if (!category) {
      throw new NotFoundException(
        getMessage('subcategories_categoryShouldBeSelected', lang),
      );
    }

    const exists = await this.subCategoryModel.findOne({
      $or: [{ 'name.ar': name_ar }, { 'name.en': name_en }],
    });

    if (exists) {
      throw new BadRequestException(
        getMessage('subcategories_subCategoryAlreadyExists', lang),
      );
    }

    const media_ar = await this.mediaService.mediaProcessor({
      file: image_ar,
      reqMsg: 'subCategories_subCategoryShouldHasArImage',
      user: req?.user,
      maxSize: MEDIA_CONFIG.SUB_CATEGORY.IMAGE.MAX_SIZE,
      allowedTypes: MEDIA_CONFIG.SUB_CATEGORY.IMAGE.ALLOWED_TYPES,
      lang,
      key: Modules.SUB_CATEGORY,
      req,
    });

    const media_en = await this.mediaService.mediaProcessor({
      file: image_en,
      reqMsg: 'subCategories_subCategoryShouldHasEnImage',
      user: req?.user,
      maxSize: MEDIA_CONFIG.SUB_CATEGORY.IMAGE.MAX_SIZE,
      allowedTypes: MEDIA_CONFIG.SUB_CATEGORY.IMAGE.ALLOWED_TYPES,
      lang,
      key: Modules.SUB_CATEGORY,
      req,
    });

    const subCategory = new this.subCategoryModel({
      name: { ar: name_ar, en: name_en },
      categoryId,
      media: { ar: media_ar, en: media_en },
      slug,
      createdBy: req?.user?.userId,
      isActive: true,
      isDeleted: false,
    });

    await subCategory.save();

    await this.categoryModel.findByIdAndUpdate(categoryId, {
      $addToSet: { subCategories: subCategory._id },
    });

    // Revalidate active categories
    await revalidateTag(
      this.revalidationService,
      REVALIDATION_TAGS.ACTIVE_CATEGORIES,
    );

    return {
      isSuccess: true,
      message: getMessage('subcategories_subCategoryCreatedSuccessfully', lang),
      data: subCategory,
    };
  }

  async update(
    req: any,
    dto: UpdateSubCategoryDto,
    image_ar: Express.Multer.File,
    image_en: Express.Multer.File,
    id: string,
  ): Promise<DataResponse<SubCategory>> {
    const { lang, name_ar, name_en, categoryId } = dto;

    validateUserRoleAccess(req?.user, lang);

    const subCategoryToUpdate = await this.subCategoryModel.findById(id);

    if (!subCategoryToUpdate) {
      throw new BadRequestException(
        getMessage('subcategories_subCategoryNotFound', lang),
      );
    }

    let slug = subCategoryToUpdate.slug;

    if (name_en) {
      slug = slugify(name_en, { lower: true });
    }

    const conflictQuery: Record<string, any> = {
      _id: { $ne: id }, // Exclude current sub-category
      $or: [],
    };

    if (name_ar) conflictQuery.$or.push({ 'name.ar': name_ar });

    if (name_en) {
      conflictQuery.$or.push({ 'name.en': name_en });
      conflictQuery.$or.push({ slug }); // Check slug conflicts
    }

    if (categoryId) conflictQuery.$or.push({ categoryId });

    if (conflictQuery.$or.length > 0) {
      const existingSubCategory =
        await this.subCategoryModel.findOne(conflictQuery);

      if (existingSubCategory) {
        throw new BadRequestException(
          getMessage('subcategories_subCategoryAlreadyExists', lang),
        );
      }
    }

    const updateData: any = {
      updatedBy: req?.user?.userId,
      updatedAt: new Date(),
    };

    if (image_ar || image_en) {
      let media_ar: MediaPreview = undefined,
        media_en: MediaPreview = undefined;

      if (image_ar) {
        const result = await this.mediaService.hardDeleteAndUpload({
          file: image_ar,
          user: req?.user,
          reqMsg: 'subCategories_subCategoryShouldHasArImage',
          maxSize: MEDIA_CONFIG.SUB_CATEGORY.IMAGE.MAX_SIZE,
          allowedTypes: MEDIA_CONFIG.SUB_CATEGORY.IMAGE.ALLOWED_TYPES,
          lang,
          key: Modules.SUB_CATEGORY,
          req,
          existingMediaId: subCategoryToUpdate.media.ar.id,
        });

        media_ar = result;
      }

      if (image_en) {
        const result = await this.mediaService.hardDeleteAndUpload({
          file: image_en,
          user: req?.user,
          reqMsg: 'subCategories_subCategoryShouldHasEnImage',
          maxSize: MEDIA_CONFIG.SUB_CATEGORY.IMAGE.MAX_SIZE,
          allowedTypes: MEDIA_CONFIG.SUB_CATEGORY.IMAGE.ALLOWED_TYPES,
          lang,
          key: Modules.SUB_CATEGORY,
          req,
          existingMediaId: subCategoryToUpdate.media.en.id,
        });

        media_en = result;
      }

      updateData.media = {
        ar: media_ar
          ? { ...media_ar, id: new mongoose.Types.ObjectId(media_ar.id) }
          : subCategoryToUpdate?.media?.ar,
        en: media_en
          ? { ...media_en, id: new mongoose.Types.ObjectId(media_en.id) }
          : subCategoryToUpdate?.media?.en,
      };
    }

    if (name_ar || name_en) {
      updateData.name = {
        ar: name_ar || subCategoryToUpdate.name.ar,
        en: name_en || subCategoryToUpdate.name.en,
      };
    }

    if (categoryId) updateData.categoryId = categoryId;

    updateData.slug = slug;

    const updatedSubCategory = await this.subCategoryModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );

    // Revalidate active categories
    await revalidateTag(
      this.revalidationService,
      REVALIDATION_TAGS.ACTIVE_CATEGORIES,
    );

    return {
      isSuccess: true,
      message: getMessage('subcategories_subCategoryUpdatedSuccessfully', lang),
      data: updatedSubCategory,
    };
  }

  async delete(
    requestingUser: any,
    body: DeleteSubCategoryDto,
    id: string,
  ): Promise<BaseResponse> {
    const { lang } = body;

    validateUserRoleAccess(requestingUser, lang);

    const subCategory = await this.subCategoryModel.findById(id);

    if (!subCategory) {
      throw new BadRequestException(
        getMessage('subcategories_subCategoryNotFound', lang),
      );
    }

    subCategory.isDeleted = true;
    subCategory.isActive = false;
    subCategory.deletedAt = new Date();
    subCategory.deletedBy = requestingUser.userId;
    subCategory.unDeletedBy = null;

    await subCategory.save();

    // Revalidate active categories
    await revalidateTag(
      this.revalidationService,
      REVALIDATION_TAGS.ACTIVE_CATEGORIES,
    );

    return {
      isSuccess: true,
      message: getMessage('subcategories_subCategoryDeletedSuccessfully', lang),
    };
  }

  async unDelete(
    requestingUser: any,
    body: UnDeleteSubCategoryBodyDto,
    id: string,
  ): Promise<BaseResponse> {
    const { lang } = body;

    validateUserRoleAccess(requestingUser, lang);

    const subCategory = await this.subCategoryModel.findById(id);

    if (!subCategory) {
      throw new BadRequestException(
        getMessage('subcategories_subCategoryNotFound', lang),
      );
    }

    subCategory.isDeleted = false;
    subCategory.deletedAt = null;
    subCategory.deletedBy = null;
    subCategory.unDeletedBy = requestingUser.userId;
    subCategory.unDeletedAt = new Date();

    await subCategory.save();

    // Revalidate active categories
    await revalidateTag(
      this.revalidationService,
      REVALIDATION_TAGS.ACTIVE_CATEGORIES,
    );

    return {
      isSuccess: true,
      message: getMessage(
        'subCategories_subCategoryUnDeletedSuccessfully',
        lang,
      ),
    };
  }

  async updateStatus(
    id: string,
    isActive: boolean,
    lang: Locale = 'en',
    requestingUser: any,
  ): Promise<BaseResponse> {
    validateUserRoleAccess(requestingUser, lang);

    const subCategory = await this.subCategoryModel.findById(id);

    if (!subCategory) {
      throw new NotFoundException(
        getMessage('subcategories_subCategoryNotFound', lang),
      );
    }

    if (isActive) {
      const parentCategory = await this.categoryModel.findById(
        subCategory.categoryId,
        { isActive: 1 },
      );

      if (!parentCategory || !parentCategory.isActive) {
        throw new BadRequestException(
          getMessage(
            'subCategories_cannotActivateWhenCategoryIsInactive',
            lang,
          ),
        );
      }

      subCategory.isDeleted = false;
      subCategory.deletedAt = null;
    }

    subCategory.isActive = isActive;

    await subCategory.save();

    // Revalidate active categories
    await revalidateTag(
      this.revalidationService,
      REVALIDATION_TAGS.ACTIVE_CATEGORIES,
    );

    // If subcategory is deactivated → deactivate its products
    if (!isActive) {
      await this.productService.deactivateBySubCategory(id, requestingUser);
    }

    return {
      isSuccess: true,
      message: getMessage(
        isActive
          ? 'subCategories_subCategoryActivatedSuccessfully'
          : 'subCategories_subCategoryDeactivatedSuccessfully',
        lang,
      ),
    };
  }

  async getAll(params: {
    lang?: Locale;
    limit?: string;
    lastId?: string;
    search?: string;
    catId?: string;
  }): Promise<DataListResponse<SubCategory>> {
    const { lang = 'en', limit = 10, lastId, search, catId } = params;

    const query: any = {};

    if (lastId) {
      query._id = { $lt: new Types.ObjectId(lastId) };
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [{ 'name.ar': searchRegex }, { 'name.en': searchRegex }];
    }

    if (catId) {
      query.categoryId = new Types.ObjectId(catId);
    }

    const subCategories = await this.subCategoryModel
      .find(query)
      .sort({ _id: -1 })
      .limit(Number(limit))
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('unDeletedBy', 'firstName lastName email _id')
      .populate('createdBy', 'firstName lastName email _id')
      .lean();

    return {
      isSuccess: true,
      message: getMessage(
        'subCategories_subCategoriesRetrievedSuccessfully',
        lang,
      ),
      dataCount: subCategories.length,
      data: subCategories,
    };
  }

  async getOne(id: string, lang?: Locale): Promise<DataResponse<SubCategory>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(
        getMessage('subCategories_invalidSubCategoryId', lang),
      );
    }

    const subCategory = await this.subCategoryModel
      .findById(id)
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('unDeletedBy', 'firstName lastName email _id')
      .populate('createdBy', 'firstName lastName email _id')
      .lean();

    if (!subCategory) {
      throw new NotFoundException(
        getMessage('subcategories_subCategoryNotFound', lang),
      );
    }

    return {
      isSuccess: true,
      message: getMessage(
        'subCategories_subCategoryRetrievedSuccessfully',
        lang,
      ),
      data: subCategory,
    };
  }

  async deactivateByCategory(
    categoryId: string,
    requestingUser: any,
  ): Promise<void> {
    const subCategories = await this.subCategoryModel
      .find(
        {
          categoryId: new Types.ObjectId(categoryId),
          isActive: true,
        },
        { _id: 1 },
      )
      .lean<{ _id: Types.ObjectId }[]>(); // lean() removes Mongoose Document noise

    if (!subCategories.length) return;

    const subCategoryIds = subCategories.map(sc => sc._id);

    // Deactivate subcategories
    await this.subCategoryModel.updateMany(
      { _id: { $in: subCategoryIds } },
      {
        $set: {
          isActive: false,
          isDeleted: false,
          updatedBy: requestingUser.userId,
          updatedAt: new Date(),
        },
      },
    );

    // Deactivate ALL products under those subcategories (ONE QUERY)
    await this.productService.deactivateBySubCategories(
      subCategoryIds,
      requestingUser,
    );
  }
}
