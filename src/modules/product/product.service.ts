import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import slugify from 'slugify';
import { Model } from 'mongoose';

import { Product, ProductDocument } from 'src/schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { MediaService } from '../media/media.service';
import { validateUserRoleAccess } from 'src/common/utils/validateUserRoleAccess';
import { TypeHint } from 'src/enums/typeHint.enums';
import { getMessage } from 'src/common/utils/translator';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
    private mediaService: MediaService,
  ) {}

  async create(
    user: any,
    dto: CreateProductDto,
    mainImage: Express.Multer.File,
    images: Express.Multer.File[],
  ) {
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

    let imageUrls: string[] = [];
    let mainImageUrl: string | undefined;

    if (mainImage) {
      const mainUpload = await this.mediaService.handleFileUpload(
        mainImage,
        { userId: user?.userId },
        lang,
      );
      if (mainUpload?.isSuccess) {
        mainImageUrl = mainUpload.fileUrl;
      }
    }

    for (const img of images) {
      const upload = await this.mediaService.handleFileUpload(
        img,
        { userId: user?.userId },
        lang,
      );
      if (upload?.isSuccess) {
        imageUrls.push(upload.fileUrl);
      }
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
      typeHint: typeHint || TypeHint.IMPORTED,
      slug,
      tags,
      categoryId,
      subCategoryId,
      mainImage: mainImageUrl || imageUrls[0],
      images: imageUrls,
      isAvailable,
      isActive: true,
      isDeleted: false,
      createdBy: user?.userId,
    });

    await product.save();

    return {
      isSuccess: true,
      message: getMessage('products_productCreatedSuccessfully', lang),
      product,
    };
  }
}
