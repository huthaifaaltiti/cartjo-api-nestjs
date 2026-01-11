import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
<<<<<<< HEAD
=======
  Inject,
  forwardRef,
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { validateUserRoleAccess } from 'src/common/utils/validateUserRoleAccess';
import { getMessage } from 'src/common/utils/translator';
import { fileSizeValidator } from 'src/common/functions/validators/fileSizeValidator';
<<<<<<< HEAD
import { MAX_FILE_SIZES } from 'src/common/utils/file-size.config';
=======
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
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
import { fileTypeValidator } from 'src/common/functions/validators/fileTypeValidator';
import slugify from 'slugify';
import { revalidateTag } from 'src/common/utils/revalidate';
import { REVALIDATION_TAGS } from 'src/common/constants/revalidation-tags';
import { RevalidationService } from '../revalidation/revalidation.service';
<<<<<<< HEAD
=======
import { MEDIA_CONFIG } from 'src/configs/media.config';
import { ProductService } from '../product/product.service';
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

@Injectable()
export class SubCategoryService {
  constructor(
    @InjectModel(SubCategory.name)
    private subCategoryModel: Model<SubCategoryDocument>,
    private mediaService: MediaService,
<<<<<<< HEAD

    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,

=======
    @Inject(forwardRef(() => ProductService))
    private productService: ProductService,
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
    private revalidationService: RevalidationService,
  ) {}

  async create(
    user: any,
    dto: CreateSubCategoryDto,
    image_ar: Express.Multer.File,
    image_en: Express.Multer.File,
  ): Promise<DataResponse<SubCategory>> {
    const { lang, name_ar, name_en, categoryId } = dto;

    validateUserRoleAccess(user, lang);

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

    const uploadMedia = async (
      file: Express.Multer.File,
      requiredMsg: string,
    ): Promise<MediaPreview | undefined> => {
      if (!file || Object.keys(file).length === 0) {
        throw new ForbiddenException(getMessage(requiredMsg, lang));
      }

<<<<<<< HEAD
      fileSizeValidator(file, MAX_FILE_SIZES.BANNER_IMAGE, lang);
      fileTypeValidator(file, ['png', 'jpeg', 'webp', 'avif'], lang);
=======
      fileSizeValidator(file, MEDIA_CONFIG.SUB_CATEGORY.IMAGE.MAX_SIZE, lang);
      fileTypeValidator(
        file,
        MEDIA_CONFIG.SUB_CATEGORY.IMAGE.ALLOWED_TYPES,
        lang,
      );
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

      const result = await this.mediaService.handleFileUpload(
        file,
        { userId: user?.userId },
        lang,
        Modules.BANNER,
      );

      if (!result?.isSuccess) {
        throw new BadRequestException(
          getMessage('subCategories_subCategoryImageUploadFailed', lang),
        );
      }

      return { id: result.mediaId, url: result.fileUrl };
    };

    const media_ar = await uploadMedia(
      image_ar,
      'subCategories_subCategoryShouldHasArImage',
    );
    const media_en = await uploadMedia(
      image_en,
      'subCategories_subCategoryShouldHasEnImage',
    );

    const subCategory = new this.subCategoryModel({
      name: { ar: name_ar, en: name_en },
      categoryId,
      media: { ar: media_ar, en: media_en },
      slug,
      createdBy: user?.userId,
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
    requestingUser: any,
    dto: UpdateSubCategoryDto,
    image_ar: Express.Multer.File,
    image_en: Express.Multer.File,
    id: string,
  ): Promise<DataResponse<SubCategory>> {
    const { lang, name_ar, name_en, categoryId } = dto;

    validateUserRoleAccess(requestingUser, lang);

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

    const uploadMedia = async (
      file: Express.Multer.File,
      requiredMsg: string,
    ): Promise<MediaPreview | undefined> => {
      if (!file || Object.keys(file).length === 0) {
        throw new ForbiddenException(getMessage(requiredMsg, lang));
      }

<<<<<<< HEAD
      fileSizeValidator(file, MAX_FILE_SIZES.BANNER_IMAGE, lang);
      fileTypeValidator(file, ['webp', 'gif', 'avif'], lang);
=======
      fileSizeValidator(file, MEDIA_CONFIG.SUB_CATEGORY.IMAGE.MAX_SIZE, lang);
      fileTypeValidator(
        file,
        MEDIA_CONFIG.SUB_CATEGORY.IMAGE.ALLOWED_TYPES,
        lang,
      );
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

      const result = await this.mediaService.handleFileUpload(
        file,
        { userId: requestingUser?.userId },
        lang,
        Modules.BANNER,
      );

      if (!result?.isSuccess) {
        throw new BadRequestException(
          getMessage('subCategories_subCategoryImageUploadFailed', lang),
        );
      }

      return { id: result.mediaId, url: result.fileUrl };
    };

    const updateData: any = {
      updatedBy: requestingUser?.userId,
      updatedAt: new Date(),
    };

    if (image_ar || image_en) {
      let media_ar: MediaPreview, media_en: MediaPreview;

      if (image_ar) {
        media_ar = await uploadMedia(
          image_ar,
          'subCategories_subCategoryShouldHasArImage',
        );
      }

      if (image_en) {
        media_en = await uploadMedia(
          image_en,
          'subCategories_subCategoryShouldHasEnImage',
        );
      }

      updateData.media = {
        ar: media_ar
          ? { ...media_ar, id: new mongoose.Types.ObjectId(media_ar.id) }
<<<<<<< HEAD
          : updateData?.media?.ar,
        en: media_en
          ? { ...media_en, id: new mongoose.Types.ObjectId(media_en.id) }
          : updateData?.media?.en,
=======
          : subCategoryToUpdate?.media?.ar,
        en: media_en
          ? { ...media_en, id: new mongoose.Types.ObjectId(media_en.id) }
          : subCategoryToUpdate?.media?.en,
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
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
<<<<<<< HEAD
=======
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

>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
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

<<<<<<< HEAD
=======
    // If subcategory is deactivated → deactivate its products
    if (!isActive) {
      await this.productService.deactivateBySubCategory(id, requestingUser);
    }

>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
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
<<<<<<< HEAD
=======

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
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
}
