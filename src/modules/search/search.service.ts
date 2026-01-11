import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from 'src/schemas/product.schema';
import { SearchProductsQueryDto } from './dto/get-search-products.dto';
import { WishList, WishListDocument } from 'src/schemas/wishList.schema';
import { getMessage } from 'src/common/utils/translator';
<<<<<<< HEAD
=======
import { SYSTEM_GENERATED_HINTS, SystemGeneratedHint } from 'src/configs/typeHint.config';
import { SystemTypeHints } from 'src/enums/systemTypeHints.enum';
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

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
<<<<<<< HEAD
=======
    const sort: any = { _id: -1 };

    // ✅ Cursor pagination
    if (lastId) {
      queryMatch._id = { $lt: new Types.ObjectId(lastId) };
    }

    // ✅ Detect system-generated hints
    const isSystemGeneratedHint = SYSTEM_GENERATED_HINTS.includes(
      typeHint as SystemGeneratedHint,
    );
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

    if (!q && !typeHint) {
      return {
        isSuccess: true,
        message: getMessage('search_noSearchForItems', lang),
        dataCount: 0,
        data: [],
      };
<<<<<<< HEAD
    } else {
      const searchRegex = new RegExp(q, 'i');

=======
    }

    if (q) {
      const searchRegex = new RegExp(q, 'i');
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
      queryMatch.$or = [
        { [`name.${lang}`]: searchRegex },
        { [`description.${lang}`]: searchRegex },
        { tags: searchRegex },
        { slug: searchRegex },
      ];
    }

<<<<<<< HEAD
    if (typeHint) queryMatch.typeHint = typeHint;

    if (lastId) {
      queryMatch._id = { $lt: new Types.ObjectId(lastId) };
    }

=======
    // ✅ Only filter by typeHint if NOT system-generated
    if (typeHint && !isSystemGeneratedHint) {
      queryMatch.typeHint = { $in: [typeHint] };
    }

    // ✅ Category filters
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
    if (categoryId) {
      queryMatch.categoryId = new Types.ObjectId(categoryId);
    }

<<<<<<< HEAD
=======
    // ✅ SubCategory filters
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
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

<<<<<<< HEAD
    // ✅ Created date filters
=======
    // ✅ Date filters
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
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

<<<<<<< HEAD
    const products = await this.productModel
      .find(queryMatch)
      .sort({ _id: -1 })
=======
    // ✅ SYSTEM TYPE HINTS BEHAVIOR
    // products ordered by views
    if (typeHint === SystemTypeHints.MOST_VIEWED) {
      queryMatch.isActive = true;
      queryMatch.isDeleted = false;
      sort.viewCount = -1;
      delete sort._id;
    }

    if (typeHint === SystemTypeHints.TRENDING) {
      queryMatch.isActive = true;
      queryMatch.isDeleted = false;
      sort.weeklyScore = -1;
      sort.weeklyFavoriteCount = -1;
      sort.weeklyViewCount = -1;
      delete sort._id;
    }

    if (typeHint === SystemTypeHints.BEST_SELLERS) {
      queryMatch.isActive = true;
      queryMatch.isDeleted = false;
      sort.sellCount = -1;
      delete sort._id;
    }

    if (typeHint === SystemTypeHints.MOST_FAVORITED) {
      queryMatch.isActive = true;
      queryMatch.isDeleted = false;
      sort.favoriteCount = -1;
      delete sort._id;
    }

    const products = await this.productModel
      .find(queryMatch)
      .sort(sort)
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
      .limit(Math.min(Number(limit), 100)) // cap at 100 max
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('unDeletedBy', 'firstName lastName email _id')
      .populate('createdBy', 'firstName lastName email _id')
      .populate('categoryId')
      .populate('subCategoryId')
      .populate('mainMediaId')
      .populate('mediaListIds')
      .lean();

<<<<<<< HEAD
=======
    //  ✅ Wishlist enrichment
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
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

<<<<<<< HEAD
    // const enrichedProducts = products.map(p => ({
    //   ...p,
    //   isWishListed: wishListProducts.includes(p._id.toString()),
    // }));

=======
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
    const enrichedProducts = products.map(p => {
      const productId = String(p._id);

      return {
        ...p,
        isWishListed: wishListProducts.includes(productId),
      };
    });

    return {
      isSuccess: true,
      message: getMessage('products_productsRetrievedSuccessfully', lang),
      dataCount: enrichedProducts.length ?? 0,
      data: enrichedProducts ?? [],
    };
  }
}
