import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { MediaService } from '../media/media.service';

import { Category, CategoryDocument } from 'src/schemas/category.schema';
import { Locale } from 'src/types/Locale';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DeleteCategoryDto } from './dto/delete-category.dto';
import { UnDeleteCategoryBodyDto } from './dto/unDelete-category.dto';
import { Modules } from 'src/enums/appModules.enum';

import { validateUserRoleAccess } from 'src/common/utils/validateUserRoleAccess';
import { getMessage } from 'src/common/utils/translator';
import { fileSizeValidator } from 'src/common/functions/validators/fileSizeValidator';
import { MAX_FILE_SIZES } from 'src/common/utils/file-size.config';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
    private mediaService: MediaService,
  ) {}

  async create(
    requestingUser: any,
    dto: CreateCategoryDto,
    image: Express.Multer.File,
  ): Promise<{
    isSuccess: boolean;
    message: string;
    category?: Category;
  }> {
    const { lang, name_ar, name_en } = dto;

    validateUserRoleAccess(requestingUser, lang);

    const existingCategory = await this.categoryModel.findOne({
      $or: [{ 'name.ar': name_ar }, { 'name.en': name_en }],
    });

    if (existingCategory) {
      throw new BadRequestException(
        getMessage('categories_categoryAlreadyExists', lang),
      );
    }

    let mediaUrl: string | undefined = undefined;
    let mediaId: string | undefined = undefined;

    if (image && Object.keys(image).length > 0) {
      fileSizeValidator(image, MAX_FILE_SIZES.CATEGORY_IMAGE, lang);

      const result = await this.mediaService.handleFileUpload(
        image,
        { userId: requestingUser?.userId },
        lang,
        Modules.CATEGORY,
      );

      if (result?.isSuccess) {
        mediaUrl = result.fileUrl;
        mediaId = result.mediaId;
      }
    }

    const category = new this.categoryModel({
      media: { id: mediaId, url: mediaUrl },
      name: { ar: name_ar, en: name_en },
      createdBy: requestingUser?.userId,
      isActive: true,
      isDeleted: false,
    });

    await category.save();

    return {
      isSuccess: true,
      message: getMessage('categories_categoryCreatedSuccessfully', lang),
      category,
    };
  }

  async update(
    requestingUser: any,
    dto: UpdateCategoryDto,
    image: Express.Multer.File,
    id: string,
  ): Promise<{
    isSuccess: boolean;
    message: string;
    category?: Category;
  }> {
    const { lang, name_ar, name_en } = dto;

    validateUserRoleAccess(requestingUser, lang);

    const categoryToUpdate = await this.categoryModel.findById(id);

    if (!categoryToUpdate) {
      throw new BadRequestException(
        getMessage('categories_categoryNotFound', lang),
      );
    }

    // Check if new names conflict with existing categories (excluding current category)
    if (name_ar || name_en) {
      const conflictQuery: any = {
        _id: { $ne: id }, // Exclude current category
        $or: [],
      };

      if (name_ar) {
        conflictQuery.$or.push({ 'name.ar': name_ar });
      }
      if (name_en) {
        conflictQuery.$or.push({ 'name.en': name_en });
      }

      const existingCategory = await this.categoryModel.findOne(conflictQuery);

      if (existingCategory) {
        throw new BadRequestException(
          getMessage('categories_categoryAlreadyExists', lang),
        );
      }
    }

    let mediaUrl: string | undefined = categoryToUpdate.media.url;
    let mediaId: string | undefined = categoryToUpdate.media.id;

    if (image && Object.keys(image).length > 0) {
      fileSizeValidator(image, MAX_FILE_SIZES.CATEGORY_IMAGE, lang);

      const result = await this.mediaService.handleFileUpload(
        image,
        { userId: requestingUser?.userId },
        lang,
        Modules.CATEGORY,
      );

      if (result?.isSuccess) {
        mediaUrl = result.fileUrl;
        mediaId = result.mediaId;
      }
    }

    const updateData: any = {
      updatedBy: requestingUser?.userId,
      updatedAt: new Date(),
    };

    if (mediaUrl !== categoryToUpdate.media?.url) {
      updateData.media = {
        id: mediaId,
        url: mediaUrl,
      };
    }

    if (name_ar || name_en) {
      updateData.name = {
        ar: name_ar || categoryToUpdate.name.ar,
        en: name_en || categoryToUpdate.name.en,
      };
    }

    const updatedCategory = await this.categoryModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );

    return {
      isSuccess: true,
      message: getMessage('categories_categoryUpdatedSuccessfully', lang),
      category: updatedCategory,
    };
  }

  async delete(
    requestingUser: any,
    body: DeleteCategoryDto,
    id: string,
  ): Promise<{
    isSuccess: boolean;
    message: string;
  }> {
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
  ): Promise<{
    isSuccess: boolean;
    message: string;
  }> {
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
  ): Promise<{
    isSuccess: boolean;
    message: string;
  }> {
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
  }): Promise<{
    isSuccess: boolean;
    message: string;
    categoriesNum: number;
    categories: Category[];
  }> {
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
      .lean();

    return {
      isSuccess: true,
      message: getMessage('categories_categoriesRetrievedSuccessfully', lang),
      categoriesNum: categories.length,
      categories,
    };
  }

  async getOne(
    id: string,
    lang?: Locale,
  ): Promise<{
    isSuccess: boolean;
    message: string;
    category: Category | null;
  }> {
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
      category,
    };
  }
}
