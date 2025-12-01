import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from 'src/schemas/product.schema';
import { SearchProductsQueryDto } from './dto/get-search-products.dto';
import { WishList, WishListDocument } from 'src/schemas/wishList.schema';
import { getMessage } from 'src/common/utils/translator';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,

    @InjectModel(WishList.name)
    private wishListModel: Model<WishListDocument>,
  ) {}

  async searchProducts(query: SearchProductsQueryDto, userId?: string) {
    const {
      q,
      lang = 'en',
      limit = 10,
      lastId,
      categoryId,
      subCategoryId,
      priceFrom,
      priceTo,
      ratingFrom,
      ratingTo,
      createdFrom,
      createdTo,
      beforeNumOfDays,
      typeHint,
    } = query;

    const queryMatch: any = {
      isActive: true,
      isDeleted: false,
    };

    if (!q && !typeHint) {
      return {
        isSuccess: true,
        message: getMessage('search_noSearchForItems', lang),
        dataCount: 0,
        data: [],
      };
    } else {
      const searchRegex = new RegExp(q, 'i');

      queryMatch.$or = [
        { [`name.${lang}`]: searchRegex },
        { [`description.${lang}`]: searchRegex },
        { tags: searchRegex },
        { slug: searchRegex },
      ];
    }

    if (typeHint) queryMatch.typeHint = typeHint;

    if (lastId) {
      queryMatch._id = { $lt: new Types.ObjectId(lastId) };
    }

    if (categoryId) {
      queryMatch.categoryId = new Types.ObjectId(categoryId);
    }

    if (subCategoryId) {
      queryMatch.subCategoryId = new Types.ObjectId(subCategoryId);
    }

    // ✅ Price filter
    if (priceFrom || priceTo) {
      queryMatch.price = {};
      if (priceFrom) queryMatch.price.$gte = Number(priceFrom);
      if (priceTo) queryMatch.price.$lte = Number(priceTo);
    }

    // ✅ Ratings filter
    if (ratingFrom || ratingTo) {
      queryMatch.ratings = {};
      if (ratingFrom) queryMatch.ratings.$gte = Number(ratingFrom);
      if (ratingTo) queryMatch.ratings.$lte = Number(ratingTo);
    }

    // ✅ Created date filters
    if (beforeNumOfDays) {
      let days = Number(beforeNumOfDays);
      if (days > 36500) days = 36500; // ~100 years sanity cap

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      queryMatch.createdAt = { $lte: cutoffDate };
    } else if (createdFrom || createdTo) {
      queryMatch.createdAt = {};
      if (createdFrom) queryMatch.createdAt.$gte = new Date(createdFrom);
      if (createdTo) queryMatch.createdAt.$lte = new Date(createdTo);
    }

    const products = await this.productModel
      .find(queryMatch)
      .sort({ _id: -1 })
      .limit(Math.min(Number(limit), 100)) // cap at 100 max
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('unDeletedBy', 'firstName lastName email _id')
      .populate('createdBy', 'firstName lastName email _id')
      .populate('categoryId')
      .populate('subCategoryId')
      .populate('mainMediaId')
      .populate('mediaListIds')
      .lean();

    // Enrich with isWishListed
    let wishListProducts: string[] = [];
    if (userId) {
      const wishList = await this.wishListModel
        .findOne({ user: userId })
        .lean();

      if (wishList) {
        wishListProducts = wishList.products.map((p: Types.ObjectId) =>
          p.toString(),
        );
      }
    }

    const enrichedProducts = products.map(p => ({
      ...p,
      isWishListed: wishListProducts.includes(p._id.toString()),
    }));

    return {
      isSuccess: true,
      message: getMessage('products_productsRetrievedSuccessfully', lang),
      dataCount: enrichedProducts.length ?? 0,
      data: enrichedProducts ?? [],
    };
  }
}
