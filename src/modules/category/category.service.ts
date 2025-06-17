import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Category, CategoryDocument } from 'src/schemas/category.schema';
import { validateUserRoleAccess } from 'src/common/utils/validateUserRoleAccess';
import { Locale } from 'src/types/Locale';

import { CreateCategoryDto } from './dto/create-category.dto';
import { MediaService } from '../media/media.service';
import { getMessage } from 'src/common/utils/translator';
import { UpdateCategoryDto } from './dto/update-category.dto';

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

    let catImage: string | undefined = undefined;

    if (image && Object.keys(image).length > 0) {
      const result = await this.mediaService.handleFileUpload(
        image,
        { userId: requestingUser?.userId },
        lang,
      );

      if (result?.isSuccess) {
        catImage = result.fileUrl;
      }
    }

    const category = new this.categoryModel({
      image: catImage,
      name: { ar: name_ar, en: name_en },
      createdBy: requestingUser?.userId,
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

    let catImage: string | undefined = categoryToUpdate.image;

    if (image && Object.keys(image).length > 0) {
      const result = await this.mediaService.handleFileUpload(
        image,
        { userId: requestingUser?.userId },
        lang,
      );

      if (result?.isSuccess) {
        catImage = result.fileUrl;
      }
    }

    const updateData: any = {
      updatedBy: requestingUser?.userId,
      updatedAt: new Date(),
    };

    if (catImage !== categoryToUpdate.image) {
      updateData.image = catImage;
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

  async getCategories(params: {
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
      .lean();

    return {
      isSuccess: true,
      message: getMessage('categories_categoriesRetrievedSuccessfully', lang),
      categoriesNum: categories.length,
      categories,
    };
  }

  async getCategory(
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
