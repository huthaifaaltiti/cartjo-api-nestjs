import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  SubCategory,
  SubCategoryDocument,
} from 'src/schemas/subCategory.schema';
import { validateUserRoleAccess } from 'src/common/utils/validateUserRoleAccess';
import { getMessage } from 'src/common/utils/translator';

import { MediaService } from '../media/media.service';
import { CreateSubCategoryDto } from './dto/create-subCategory.dto';
import { UpdateSubCategoryDto } from './dto/update-subCategory.dto';

@Injectable()
export class SubCategoryService {
  constructor(
    @InjectModel(SubCategory.name)
    private subCategoryModel: Model<SubCategoryDocument>,
    private mediaService: MediaService,
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
      const result = await this.mediaService.handleFileUpload(
        image,
        { userId: user?.userId },
        lang,
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
      const result = await this.mediaService.handleFileUpload(
        image,
        { userId: requestingUser?.userId },
        lang,
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
}
