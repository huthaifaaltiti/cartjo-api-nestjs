import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { validateUserRoleAccess } from 'src/common/utils/validateUserRoleAccess';
import { getMessage } from 'src/common/utils/translator';
import { fileSizeValidator } from 'src/common/functions/validators/fileSizeValidator';
import { MAX_FILE_SIZES } from 'src/common/utils/file-size.config';

import { MediaService } from '../media/media.service';

import {
  SubCategory,
  SubCategoryDocument,
} from 'src/schemas/subCategory.schema';
import { Locale } from 'src/types/Locale';
import { Category, CategoryDocument } from 'src/schemas/category.schema';
import { Modules } from 'src/enums/appModules.enum';
import { CreateSubCategoryDto } from './dto/create-subCategory.dto';
import { UpdateSubCategoryDto } from './dto/update-subCategory.dto';
import { DeleteSubCategoryDto } from './dto/delete-subCategory.dto';
import { UnDeleteSubCategoryBodyDto } from './dto/unDelete-subCategory.dto';

@Injectable()
export class SubCategoryService {
  constructor(
    @InjectModel(SubCategory.name)
    private subCategoryModel: Model<SubCategoryDocument>,
    private mediaService: MediaService,

    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(
    user: any,
    dto: CreateSubCategoryDto,
    image: Express.Multer.File,
  ): Promise<any> {
    const { lang, name_ar, name_en, categoryId } = dto;

    validateUserRoleAccess(user, lang);

    // const exists = await this.subCategoryModel.findOne({
    //   'name.ar': name_ar,
    //   'name.en': name_en,
    //   categoryId,
    // });

    const exists = await this.subCategoryModel.findOne({
      $or: [{ 'name.ar': name_ar }, { 'name.en': name_en }, { categoryId }],
    });

    if (exists) {
      throw new BadRequestException(
        getMessage('subcategories_subCategoryAlreadyExists', lang),
      );
    }

    let imageUrl: string | undefined = undefined;
    if (image && Object.keys(image).length > 0) {
      fileSizeValidator(image, MAX_FILE_SIZES.SUBCATEGORY_IMAGE, lang);

      const result = await this.mediaService.handleFileUpload(
        image,
        { userId: user?.userId },
        lang,
        Modules.SUB_CATEGORY,
      );
      if (result?.isSuccess) imageUrl = result.fileUrl;
    }

    const subCategory = new this.subCategoryModel({
      name: { ar: name_ar, en: name_en },
      categoryId,
      image: imageUrl,
      createdBy: user?.userId,
      isActive: true,
      isDeleted: false,
    });

    await subCategory.save();

    await this.categoryModel.findByIdAndUpdate(categoryId, {
      $addToSet: { subCategories: subCategory._id },
    });

    return {
      isSuccess: true,
      message: getMessage('subcategories_subCategoryCreatedSuccessfully', lang),
      subCategory,
    };
  }

  async update(
    requestingUser: any,
    dto: UpdateSubCategoryDto,
    image: Express.Multer.File,
    id: string,
  ): Promise<{
    isSuccess: boolean;
    message: string;
    subCategory?: SubCategory;
  }> {
    const { lang, name_ar, name_en, categoryId } = dto;

    validateUserRoleAccess(requestingUser, lang);

    const subCategoryToUpdate = await this.subCategoryModel.findById(id);

    if (!subCategoryToUpdate) {
      throw new BadRequestException(
        getMessage('subcategories_subCategoryNotFound', lang),
      );
    }

    // Check for name/category conflict (excluding current)
    if (name_ar || name_en || categoryId) {
      const conflictQuery: any = {
        _id: { $ne: id },
        $or: [],
      };

      if (name_ar) conflictQuery.$or.push({ 'name.ar': name_ar });
      if (name_en) conflictQuery.$or.push({ 'name.en': name_en });
      if (categoryId) conflictQuery.$or.push({ categoryId });

      const conflict = await this.subCategoryModel.findOne(conflictQuery);

      if (conflict) {
        throw new BadRequestException(
          getMessage('subcategories_subCategoryAlreadyExists', lang),
        );
      }
    }

    let imageUrl = subCategoryToUpdate.image;

    if (image && Object.keys(image).length > 0) {
      fileSizeValidator(image, MAX_FILE_SIZES.SUBCATEGORY_IMAGE, lang);

      const result = await this.mediaService.handleFileUpload(
        image,
        { userId: requestingUser?.userId },
        lang,
        Modules.SUB_CATEGORY,
      );
      if (result?.isSuccess) imageUrl = result.fileUrl;
    }

    const updatedData: any = {
      updatedBy: requestingUser?.userId,
      updatedAt: new Date(),
    };

    if (imageUrl !== subCategoryToUpdate.image) updatedData.image = imageUrl;

    if (name_ar || name_en) {
      updatedData.name = {
        ar: name_ar || subCategoryToUpdate.name.ar,
        en: name_en || subCategoryToUpdate.name.en,
      };
    }

    if (categoryId) updatedData.categoryId = categoryId;

    const updatedSubCategory = await this.subCategoryModel.findByIdAndUpdate(
      id,
      updatedData,
      { new: true },
    );

    return {
      isSuccess: true,
      message: getMessage('subcategories_subCategoryUpdatedSuccessfully', lang),
      subCategory: updatedSubCategory,
    };
  }

  async delete(
    requestingUser: any,
    body: DeleteSubCategoryDto,
    id: string,
  ): Promise<{
    isSuccess: boolean;
    message: string;
  }> {
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

    return {
      isSuccess: true,
      message: getMessage('subcategories_subCategoryDeletedSuccessfully', lang),
    };
  }

  async unDelete(
    requestingUser: any,
    body: UnDeleteSubCategoryBodyDto,
    id: string,
  ): Promise<{
    isSuccess: boolean;
    message: string;
  }> {
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
  ): Promise<{
    isSuccess: boolean;
    message: string;
  }> {
    validateUserRoleAccess(requestingUser, lang);

    const subCategory = await this.subCategoryModel.findById(id);

    if (!subCategory) {
      throw new NotFoundException(
        getMessage('subcategories_subCategoryNotFound', lang),
      );
    }

    if (isActive) {
      subCategory.isDeleted = false;
      subCategory.deletedAt = null;
    }

    subCategory.isActive = isActive;

    await subCategory.save();

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
  }): Promise<{
    isSuccess: boolean;
    message: string;
    subCategoriesNum: number;
    subCategories: SubCategory[];
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
      subCategoriesNum: subCategories.length,
      subCategories,
    };
  }

  async getOne(
    id: string,
    lang?: Locale,
  ): Promise<{
    isSuccess: boolean;
    message: string;
    subCategory: SubCategory | null;
  }> {
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
      subCategory,
    };
  }
}
