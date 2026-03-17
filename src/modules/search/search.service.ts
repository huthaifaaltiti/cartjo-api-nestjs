import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from 'src/schemas/product.schema';
import { SearchProductsQueryDto } from './dto/get-search-products.dto';
import { WishList, WishListDocument } from 'src/schemas/wishList.schema';
import { getMessage } from 'src/common/utils/translator';
import {
  SYSTEM_GENERATED_HINTS,
  SystemGeneratedHint,
} from 'src/configs/typeHint.config';
import { SystemTypeHints } from 'src/enums/systemTypeHints.enum';

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
    const sort: any = { _id: -1 };

    // ✅ Cursor pagination
    if (lastId) {
      queryMatch._id = { $lt: new Types.ObjectId(lastId) };
    }

    // ✅ Detect system-generated hints
    const isSystemGeneratedHint = SYSTEM_GENERATED_HINTS.includes(
      typeHint as SystemGeneratedHint,
    );

    if (!q && !typeHint) {
      return {
        isSuccess: true,
        message: getMessage('search_noSearchForItems', lang),
        dataCount: 0,
        data: [],
      };
    }

    // Query search
    if (q) {
      const searchRegex = new RegExp(q, 'i');
      queryMatch.$or = [
        { [`name.${lang}`]: searchRegex },
        { [`description.${lang}`]: searchRegex },
        { tags: searchRegex },
        { slug: searchRegex },
        { [`variants.description.${lang}`]: searchRegex },
        { ['variants.sku']: searchRegex },
        { ['variants.tags']: searchRegex },
      ];
    }

    // ✅ Only filter by typeHint if NOT system-generated
    if (typeHint && !isSystemGeneratedHint) {
      queryMatch.typeHints = { $in: [typeHint] };
    }

    // ✅ Category filters
    if (categoryId) {
      queryMatch.categoryId = new Types.ObjectId(categoryId);
    }

    // ✅ SubCategory filters
    if (subCategoryId) {
      queryMatch.subCategoryId = new Types.ObjectId(subCategoryId);
    }

    // Price
    if (priceFrom || priceTo) {
      queryMatch['variants.priceAfterDiscount'] = {};
      if (priceFrom)
        queryMatch['variants.priceAfterDiscount'].$gte = Number(priceFrom);
      if (priceTo)
        queryMatch['variants.priceAfterDiscount'].$lte = Number(priceTo);
    }

    // Ratings
    if (ratingFrom || ratingTo) {
      // Product-level ratings filter
      // queryMatch.ratingsAverage = {};
      // if (ratingFrom) queryMatch.ratingsAverage.$gte = Number(ratingFrom);
      // if (ratingTo) queryMatch.ratingsAverage.$lte = Number(ratingTo);

      // For variant-level ratings, we would need to use $elemMatch, but this can lead to performance issues and may not be necessary if we assume that product-level ratings are sufficient for search filtering.
      queryMatch.variants = {
        $elemMatch: {
          isActive: true,
          ...(ratingFrom && { ratingsAverage: { $gte: Number(ratingFrom) } }),
          ...(ratingTo && { ratingsAverage: { $lte: Number(ratingTo) } }),
        },
      };
    }

    // ✅ Date filters
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

    // ✅ SYSTEM TYPE HINTS BEHAVIOR
    // products ordered by views
    if (typeHint === SystemTypeHints.MOST_VIEWED) {
      queryMatch.isActive = true;
      queryMatch.isDeleted = false;
      sort.viewCount = -1;
    }

    if (typeHint === SystemTypeHints.TRENDING) {
      queryMatch.isActive = true;
      queryMatch.isDeleted = false;
      sort.weeklyScore = -1;
      sort.weeklyFavoriteCount = -1;
      sort.weeklyViewCount = -1;
    }

    if (typeHint === SystemTypeHints.BEST_SELLERS) {
      queryMatch.isActive = true;
      queryMatch.isDeleted = false;
      sort.sellCount = -1;
    }

    if (typeHint === SystemTypeHints.MOST_FAVORITED) {
      queryMatch.isActive = true;
      queryMatch.isDeleted = false;
      sort.favoriteCount = -1;
    }

    const products = await this.productModel
      .find(queryMatch)
      .sort(sort)
      .limit(Math.min(Number(limit), 100)) // cap at 100 max
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('unDeletedBy', 'firstName lastName email _id')
      .populate('createdBy', 'firstName lastName email _id')
      .populate('categoryId')
      .populate('subCategoryId')
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

    const enrichedProducts = products
      .map(p => {
        const productId = String(p._id);

        // const filteredVariants =
        //   p.variants?.filter(v => v.isActive === true && v.isDeleted === false) ||
        //   [];
        const filteredVariants =
          p.variants?.filter(v => v.isActive === true) || [];

        if (!filteredVariants.length) return null;

        return {
          ...p,
          // variants: filteredVariants,
          variants: filteredVariants,
          isWishListed: wishListProducts.includes(productId),
        };
      })
      .filter(Boolean);

    return {
      isSuccess: true,
      message: getMessage('products_productsRetrievedSuccessfully', lang),
      dataCount: enrichedProducts.length ?? 0,
      data: enrichedProducts ?? [],
    };
  }
}
