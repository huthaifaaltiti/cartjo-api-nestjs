import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import slugify from 'slugify';
import { MediaService } from '../media/media.service';
import {
  BaseResponse,
  DataListResponse,
  DataResponse,
} from 'src/types/service-response.type';
import { Category, CategoryDocument } from 'src/schemas/category.schema';
import { Locale } from 'src/types/Locale';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DeleteCategoryDto } from './dto/delete-category.dto';
import { UnDeleteCategoryBodyDto } from './dto/unDelete-category.dto';
import { Modules } from 'src/enums/appModules.enum';
import { validateUserRoleAccess } from 'src/common/utils/validateUserRoleAccess';
import { getMessage } from 'src/common/utils/translator';
import { MediaPreview } from 'src/schemas/common.schema';
import { GetActiveOnesQueryDto } from './dto/get-active-ones.dto';
import { MEDIA_CONFIG } from 'src/configs/media.config';
import { SubCategoryService } from '../subCategory/subCategory.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
    private mediaService: MediaService,
    @Inject(forwardRef(() => SubCategoryService))
    private subCategoryService: SubCategoryService,
  ) {}

  async create(
    requestingUser: any,
    dto: CreateCategoryDto,
    image_ar: Express.Multer.File,
    image_en: Express.Multer.File,
    req: any,
  ): Promise<DataResponse<Category>> {
    const { lang, name_ar, name_en } = dto;

    validateUserRoleAccess(requestingUser, lang);

    const slug = name_en ? slugify(name_en, { lower: true }) : undefined;

    const existingCategory = await this.categoryModel.findOne({
      $or: [{ 'name.ar': name_ar }, { 'name.en': name_en }, { slug }],
    });

    if (existingCategory) {
      throw new BadRequestException(
        getMessage('categories_categoryAlreadyExists', lang),
      );
    }

    const media_ar = await this.mediaService.mediaProcessor({
      file: image_ar,
      user: requestingUser,
      reqMsg: 'categories_categoryShouldHasArImage',
      maxSize: MEDIA_CONFIG.CATEGORY.IMAGE.MAX_SIZE,
      allowedTypes: MEDIA_CONFIG.CATEGORY.IMAGE.ALLOWED_TYPES,
      lang,
      key: Modules.CATEGORY,
      req,
    });
    const media_en = await this.mediaService.mediaProcessor({
      file: image_en,
      user: requestingUser,
      reqMsg: 'categories_categoryShouldHasEnImage',
      maxSize: MEDIA_CONFIG.CATEGORY.IMAGE.MAX_SIZE,
      allowedTypes: MEDIA_CONFIG.CATEGORY.IMAGE.ALLOWED_TYPES,
      lang,
      key: Modules.CATEGORY,
      req,
    });

    const category = new this.categoryModel({
      media: { ar: media_ar, en: media_en },
      name: { ar: name_ar, en: name_en },
      slug,
      createdBy: requestingUser?.userId,
      isActive: true,
      isDeleted: false,
    });

    await category.save();

    return {
      isSuccess: true,
      message: getMessage('categories_categoryCreatedSuccessfully', lang),
      data: category,
    };
  }

  async update(
    requestingUser: any,
    dto: UpdateCategoryDto,
    image_ar: Express.Multer.File,
    image_en: Express.Multer.File,
    id: string,
    req: any,
  ): Promise<DataResponse<Category>> {
    const { lang, name_ar, name_en } = dto;

    validateUserRoleAccess(requestingUser, lang);

    const categoryToUpdate = await this.categoryModel.findById(id);

    if (!categoryToUpdate) {
      throw new BadRequestException(
        getMessage('categories_categoryNotFound', lang),
      );
    }

    let slug = categoryToUpdate.slug;
    if (name_en) {
      slug = slugify(name_en, { lower: true });
    }

    const conflictQuery: Record<string, any> = {
      _id: { $ne: id }, // Exclude current category
      $or: [],
    };

    if (name_ar) conflictQuery.$or.push({ 'name.ar': name_ar });

    if (name_en) {
      conflictQuery.$or.push({ 'name.en': name_en });
      conflictQuery.$or.push({ slug }); // Check slug conflicts
    }

    if (conflictQuery.$or.length > 0) {
      const existingCategory = await this.categoryModel.findOne(conflictQuery);

      if (existingCategory) {
        throw new BadRequestException(
          getMessage('categories_categoryAlreadyExists', lang),
        );
      }
    }

    const updateData: any = {
      updatedBy: requestingUser?.userId,
      updatedAt: new Date(),
    };

    if (image_ar || image_en) {
      let media_ar: MediaPreview = undefined,
        media_en: MediaPreview = undefined;

      if (image_ar) {
        const result = await this.mediaService.hardDeleteAndUpload({
          file: image_ar,
          user: requestingUser,
          reqMsg: 'categories_categoryShouldHasArImage',
          maxSize: MEDIA_CONFIG.CATEGORY.IMAGE.MAX_SIZE,
          allowedTypes: MEDIA_CONFIG.CATEGORY.IMAGE.ALLOWED_TYPES,
          lang,
          key: Modules.CATEGORY,
          req,
          existingMediaId: categoryToUpdate.media.ar.id,
        });

        media_ar = result;
      }

      if (image_en) {
        const result = await this.mediaService.hardDeleteAndUpload({
          file: image_en,
          user: requestingUser,
          reqMsg: 'categories_categoryShouldHasEnImage',
          maxSize: MEDIA_CONFIG.CATEGORY.IMAGE.MAX_SIZE,
          allowedTypes: MEDIA_CONFIG.CATEGORY.IMAGE.ALLOWED_TYPES,
          lang,
          key: Modules.CATEGORY,
          req,
          existingMediaId: categoryToUpdate.media.en.id,
        });

        media_en = result;
      }

      updateData.media = {
        ar: media_ar
          ? { ...media_ar, id: new mongoose.Types.ObjectId(media_ar.id) }
          : categoryToUpdate?.media?.ar,
        en: media_en
          ? { ...media_en, id: new mongoose.Types.ObjectId(media_en.id) }
          : categoryToUpdate?.media?.en,
      };
    }

    if (name_ar || name_en) {
      updateData.name = {
        ar: name_ar || categoryToUpdate.name.ar,
        en: name_en || categoryToUpdate.name.en,
      };
    }

    updateData.slug = slug;

    const updatedCategory = await this.categoryModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );

    return {
      isSuccess: true,
      message: getMessage('categories_categoryUpdatedSuccessfully', lang),
      data: updatedCategory,
    };
  }

  async delete(
    requestingUser: any,
    body: DeleteCategoryDto,
    id: string,
  ): Promise<BaseResponse> {
    const { lang } = body;

    validateUserRoleAccess(requestingUser, lang);

    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new BadRequestException(
        getMessage('categories_categoryNotFound', lang),
      );
    }

    category.isDeleted = true;
    category.isActive = false;
    category.deletedAt = new Date();
    category.deletedBy = requestingUser.userId;
    category.unDeletedBy = null;

    await category.save();

    return {
      isSuccess: true,
      message: getMessage('categories_categoryDeletedSuccessfully', lang),
    };
  }

  async unDelete(
    requestingUser: any,
    body: UnDeleteCategoryBodyDto,
    id: string,
  ): Promise<BaseResponse> {
    const { lang } = body;

    validateUserRoleAccess(requestingUser, lang);

    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new BadRequestException(
        getMessage('categories_categoryNotFound', lang),
      );
    }

    category.isDeleted = false;
    category.deletedAt = null;
    category.deletedBy = null;
    category.unDeletedBy = requestingUser.userId;
    category.unDeletedAt = new Date();

    await category.save();

    return {
      isSuccess: true,
      message: getMessage('categories_categoryUnDeletedSuccessfully', lang),
    };
  }

  async updateStatus(
    id: string,
    isActive: boolean,
    lang: Locale = 'en',
    requestingUser: any,
  ): Promise<BaseResponse> {
    validateUserRoleAccess(requestingUser, lang);

    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new NotFoundException(
        getMessage('categories_categoryNotFound', lang),
      );
    }

    if (isActive) {
      category.isDeleted = false;
      category.deletedAt = null;
    }

    category.isActive = isActive;

    await category.save();

    // If main category is deactivated → deactivate all subcategories
    if (!isActive && category.subCategories?.length) {
      await this.subCategoryService.deactivateByCategory(id, requestingUser);
    }

    return {
      isSuccess: true,
      message: getMessage(
        isActive
          ? 'categories_categoryActivatedSuccessfully'
          : 'categories_categoryDeactivatedSuccessfully',
        lang,
      ),
    };
  }

  async getAll(params: {
    lang?: Locale;
    limit?: string;
    lastId?: string;
    search?: string;
  }): Promise<DataListResponse<Category>> {
    const { lang = 'en', limit = 10, lastId, search } = params;

    const query: any = {};

    if (lastId) {
      query._id = { $lt: new Types.ObjectId(lastId) };
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [{ 'name.ar': searchRegex }, { 'name.en': searchRegex }];
    }

    const categories = await this.categoryModel
      .find(query)
      .sort({ _id: -1 })
      .limit(Number(limit))
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('unDeletedBy', 'firstName lastName email _id')
      .populate('createdBy', 'firstName lastName email _id')
      .populate('subCategories')
      .select('-__v')
      .lean();

    return {
      isSuccess: true,
      message: getMessage('categories_categoriesRetrievedSuccessfully', lang),
      dataCount: categories.length,
      data: categories,
    };
  }

  async getActiveOnes(
    query: GetActiveOnesQueryDto,
  ): Promise<DataListResponse<Category>> {
    const findQuery = {
      isActive: true,
      isDeleted: false,
    };

    const categories = await this.categoryModel
      .find(findQuery)
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('unDeletedBy', 'firstName lastName email _id')
      .populate('createdBy', 'firstName lastName email _id')
      .populate('subCategories')
      .limit(Number(query.limit))
      .lean();

    if (categories.length === 0) {
      throw new NotFoundException(
        getMessage('categories_noActiveCategoriesFound', query.lang),
      );
    }

    return {
      isSuccess: true,
      message: getMessage(
        'categories_activeCategoriesRetrievedSuccessfully',
        query.lang,
      ),
      dataCount: categories.length,
      data: categories,
    };
  }

  async getOne(id: string, lang?: Locale): Promise<DataResponse<Category>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(
        getMessage('categories_invalidCategoryId', lang),
      );
    }

    const category = await this.categoryModel
      .findById(id)
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('unDeletedBy', 'firstName lastName email _id')
      .populate('createdBy', 'firstName lastName email _id')
      .populate('subCategories')
      .lean();

    if (!category) {
      throw new NotFoundException(
        getMessage('categories_categoryNotFound', lang),
      );
    }

    return {
      isSuccess: true,
      message: getMessage('categories_categoryRetrievedSuccessfully', lang),
      data: category,
    };
  }
}
