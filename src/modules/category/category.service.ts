import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Category, CategoryDocument } from 'src/schemas/category.schema';
import { validateUserRoleAccess } from 'src/common/utils/validateUserRoleAccess';

import { CreateCategoryDto } from './dto/create-category.dto';
import { MediaService } from '../media/media.service';
import { getMessage } from 'src/common/utils/translator';

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
}
