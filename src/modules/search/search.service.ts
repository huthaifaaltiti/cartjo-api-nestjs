import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../../schemas/product.schema';
import { SearchProductsQueryDto } from './dto/get-search-products.dto';
import { WishList, WishListDocument } from '../../schemas/wishList.schema';
import { getMessage } from '../../common/utils/translator';
import {
  SYSTEM_GENERATED_HINTS,
  SystemGeneratedHint,
} from '../../configs/typeHint.config';
import { SystemTypeHints } from '../../enums/systemTypeHints.enum';
import {
  TypeHintConfig,
  TypeHintConfigDocument,
} from '../../schemas/typeHintConfig.schema';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,

    @InjectModel(WishList.name)
    private wishListModel: Model<WishListDocument>,

    @InjectModel(TypeHintConfig.name)
    private typeHintConfigModel: Model<TypeHintConfigDocument>,
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

    // Text search
    if (q) {
      const regex = new RegExp(q, 'i');
      queryMatch.$or = [
        { [`name.${lang}`]: regex },
        { [`description.${lang}`]: regex },
        { tags: regex },
        { slug: regex },
        { [`variants.description.${lang}`]: regex },
        { ['variants.sku']: regex },
        { ['variants.tags']: regex },
      ];
    }

    // TypeHint filter (non-system only)
    if (typeHint && !isSystemGeneratedHint) {
      queryMatch.typeHints = { $in: [typeHint] };
    }

    if (categoryId) {
      queryMatch.categoryId = new Types.ObjectId(categoryId);
    }

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

    // Date filters
    if (beforeNumOfDays) {
      let days = Math.min(Number(beforeNumOfDays), 36500);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);

      queryMatch.variants = {
        ...(queryMatch.variants || {}),
        $elemMatch: {
          ...(queryMatch.variants?.$elemMatch || {}),
          createdAt: { $gte: cutoff },
          isActive: true,
        },
      };
    } else if (createdFrom || createdTo) {
      // Products created within a specific date range
      // queryMatch.createdAt = {};
      // if (createdFrom) queryMatch.createdAt.$gte = new Date(createdFrom);
      // if (createdTo) queryMatch.createdAt.$lte = new Date(createdTo);

      // Filtering by created date of variants instead of products, as it's more relevant to the search results and avoids excluding products that have older variants but newer ones that are still relevant.
      queryMatch.variants = {
        ...(queryMatch.variants || {}),
        $elemMatch: {
          ...(queryMatch.variants?.$elemMatch || {}),
          ...(createdFrom && { createdAt: { $gte: new Date(createdFrom) } }),
          ...(createdTo && {
            createdAt: {
              ...(createdFrom ? { $gte: new Date(createdFrom) } : {}),
              $lte: new Date(createdTo),
            },
          }),
          isActive: true,
        },
      };
    }

    // System sorting
    if (typeHint === SystemTypeHints.MOST_VIEWED) {
      sort.viewCount = -1;
      delete sort._id;
    }

    if (typeHint === SystemTypeHints.TRENDING) {
      sort.weeklyScore = -1;
      sort.weeklyFavoriteCount = -1;
      sort.weeklyViewCount = -1;
      delete sort._id;
    }

    if (typeHint === SystemTypeHints.BEST_SELLERS) {
      sort.sellCount = -1;
    }

    if (typeHint === SystemTypeHints.MOST_FAVORITED) {
      sort.favoriteCount = -1;
      delete sort._id;
    }

    const products = await this.productModel
      .find(queryMatch)
      .sort(sort)
      .limit(Math.min(Number(limit), 100))
      .populate({
        path: 'categoryId',
        match: { isActive: true, isDeleted: false },
      })
      .populate({
        path: 'subCategoryId',
        match: { isActive: true, isDeleted: false },
      })
      .populate('createdBy', 'firstName lastName email _id')
      .lean();

    const allKeys = [...new Set(products.flatMap(p => p.typeHints || []))];

    const typeHints = await this.typeHintConfigModel
      .find({
        key: { $in: allKeys },
        isDeleted: false,
      })
      .lean();

    const typeHintMap = new Map(typeHints.map(h => [h.key, h]));

    // Wishlist
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
        // remove invalid category/subcategory
        if (!p.categoryId || !p.subCategoryId) return null;

        const filteredVariants =
          p.variants?.filter(v => v.isActive === true) || [];

        if (!filteredVariants.length) return null;

        const activeTypeHints = (p.typeHints || [])
          .map(key => typeHintMap.get(key))
          .filter((h: any) => h && h.isActive && !h.isDeleted && !h.isExpired);

        // remove product if no active typeHints
        if (!activeTypeHints.length) return null;

        return {
          ...p,
          variants: filteredVariants,
          isWishListed: wishListProducts.includes(String(p._id)),
          typeHintsData: activeTypeHints,
        };
      })
      .filter(Boolean);

    return {
      isSuccess: true,
      message: getMessage('products_productsRetrievedSuccessfully', lang),
      dataCount: enrichedProducts.length,
      data: enrichedProducts,
    };
  }
}
