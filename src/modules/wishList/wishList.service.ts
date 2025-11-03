import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { getMessage } from 'src/common/utils/translator';
import { WishList, WishListDocument } from 'src/schemas/wishList.schema';
import { Locale } from 'src/types/Locale';
import { DataResponse } from 'src/types/service-response.type';
import { WishListItemBodyDto } from './dto/wishlist-item.dto';
import {
  SendAllWishListItemsBodyDto,
  WishListItemsBodyDto,
} from './dto/wishlist-items.dto';
import { Product, ProductDocument } from 'src/schemas/product.schema';
import { Cart, CartDocument } from 'src/schemas/cart.schema';
import { CartService } from '../cart/cart.service';

@Injectable()
export class WishListService {
  constructor(
    @InjectModel(WishList.name)
    private readonly wishListModel: Model<WishListDocument>,
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
    @InjectModel(Cart.name)
    private cartModel: Model<CartDocument>,
    private cartService: CartService,
  ) {}

  isValidProduct = async (
    prodId: mongoose.Types.ObjectId,
    lang: Locale,
  ): Promise<void> => {
    const product = await this.productModel.findOne({
      _id: new Types.ObjectId(prodId),
    });
    if (!product) {
      throw new NotFoundException(getMessage('wishList_notFoundProduct', lang));
    }
  };

  async getWishList(
    requestingUser: any,
    params: {
      lang?: Locale;
      limit?: number;
      lastId?: string;
      search?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<DataResponse<any>> {
    const { lang = 'en', limit = 10, lastId, search } = params;

    // Get wishlist for this user
    let wishList = await this.wishListModel
      .findOne({ user: requestingUser.userId })
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('createdBy', 'firstName lastName email _id')
      .populate('updatedBy', 'firstName lastName email _id')
      .populate('restoredBy', 'firstName lastName email _id')
      .select('-__v')
      .lean();

    if (!wishList) {
      // Auto create wishlist if not exist
      wishList = await this.wishListModel.create({
        user: requestingUser.userId,
        createdBy: requestingUser.userId,
      });
      wishList = wishList.toObject();
    }

    // If wishlist is empty, return empty result
    if (!wishList.products || wishList.products.length === 0) {
      return {
        isSuccess: true,
        message: getMessage('wishList_wishListRetrievedSuccessfully', lang),
        data: {
          ...wishList,
          productsCount: 0,
          products: [],
        },
      };
    }

    // Build query for products in wishlist
    const baseQuery: any = {
      _id: { $in: wishList.products },
      isDeleted: { $ne: true }, // Only active products
      isActive: true,
    };

    if (search) {
      baseQuery.$or = [
        { 'name.en': new RegExp(search, 'i') },
        { 'name.ar': new RegExp(search, 'i') },
      ];
    }

    // Count total products matching the criteria
    const totalProductsCount =
      await this.productModel.countDocuments(baseQuery);

    // Apply pagination
    const paginatedQuery = { ...baseQuery };
    if (lastId) {
      paginatedQuery._id = {
        $in: wishList.products,
        $lt: new Types.ObjectId(lastId),
      };
    }

    const products = await this.productModel
      .find(paginatedQuery)
      .sort({ _id: -1 })
      .limit(Number(limit))
      .lean();

    // Mark products as wishlisted
    const enrichedProducts = products.map((p: any) => ({
      ...p,
      isWishListed: true,
    }));

    return {
      isSuccess: true,
      message: getMessage('wishList_wishListRetrievedSuccessfully', lang),
      data: {
        ...wishList,
        productsCount: totalProductsCount,
        products: enrichedProducts,
      },
    };
  }

  async addWishListItem(
    requestingUser: any,
    dto: WishListItemBodyDto,
  ): Promise<DataResponse<WishList>> {
    const { lang, productId } = dto;

    await this.isValidProduct(productId, lang);

    let wishList = await this.wishListModel.findOne({
      user: requestingUser.userId,
    });

    if (!wishList) {
      // Create new wishlist
      wishList = await this.wishListModel.create({
        user: requestingUser.userId,
        createdBy: requestingUser.userId,
        products: [productId],
      });
    } else {
      // Check if product already exists
      const productExists = wishList.products.some(p =>
        p.equals(new Types.ObjectId(productId)),
      );

      if (productExists) {
        throw new BadRequestException(
          getMessage('wishList_productIsInWishList', lang),
        );
      }

      // Add product to wishlist
      wishList.products.push(new Types.ObjectId(productId));
      wishList.updatedBy = requestingUser.userId;
      await wishList.save();
    }

    // Increment favoriteCount atomically
    await this.productModel.updateOne(
      { _id: productId },
      { $inc: { favoriteCount: 1 } },
    );

    return {
      isSuccess: true,
      message: getMessage('wishList_productAddedSuccessfully', lang),
      data: wishList,
    };
  }

  async sendToCart(
    requestingUser: any,
    dto: WishListItemBodyDto,
  ): Promise<DataResponse<Cart>> {
    const { lang, productId } = dto;

    await this.isValidProduct(productId, lang);

    await this.cartService.addCartItem(requestingUser, { ...dto, quantity: 1 });

    // Remove from wishlist
    await this.wishListModel.updateOne(
      { user: requestingUser.userId },
      { $pull: { products: productId } },
    );

    const cart = await this.cartModel.findOne({
      userId: requestingUser.userId,
    });

    return {
      isSuccess: true,
      message: getMessage('wishlist_productSentToCartSuccessfully', lang),
      data: cart,
    };
  }

  async sendAllToCart(
    requestingUser: any,
    dto: SendAllWishListItemsBodyDto,
  ): Promise<DataResponse<WishList>> {
    const { lang } = dto;

    const wishList = await this.wishListModel.findOne({
      user: requestingUser.userId,
    });

    if (!wishList || !wishList.products.length)
      throw new NotFoundException(
        getMessage('wishList_noProductsToSend', lang),
      );

    await Promise.all(
      wishList.products.map((product: any) => {
        return this.sendToCart(requestingUser, {
          productId: product._id,
          lang,
        });
      }),
    );

    wishList.products = [];
    await wishList.save();

    return {
      isSuccess: true,
      message: getMessage('wishlist_productsSentToCartSuccessfully', lang),
      data: wishList,
    };
  }

  async removeWishListItem(
    requestingUser: any,
    dto: WishListItemBodyDto,
  ): Promise<DataResponse<WishList>> {
    const { lang, productId } = dto;

    await this.isValidProduct(productId, lang);

    const wishList = await this.wishListModel.findOne({
      user: requestingUser.userId,
    });

    if (!wishList) {
      throw new NotFoundException(getMessage('wishList_notFound', lang));
    }

    const productObjectId = new Types.ObjectId(productId);

    // Check if product exists in wishlist
    const productIndex = wishList.products.findIndex((p: any) =>
      p.equals(productObjectId),
    );

    if (productIndex === -1) {
      throw new BadRequestException(
        getMessage('wishList_productNotInWishList', lang),
      );
    }

    // Remove product from wishlist
    wishList.products.splice(productIndex, 1);
    wishList.updatedBy = requestingUser.userId;
    await wishList.save();

    // Decrement favoriteCount atomically, but not below zero
    await this.productModel.updateOne(
      { _id: productId, favoriteCount: { $gt: 0 } },
      { $inc: { favoriteCount: -1 } },
    );

    return {
      isSuccess: true,
      message: getMessage('wishList_productRemovedSuccessfully', lang),
      data: wishList,
    };
  }

  async removeAllWishListItems(
    requestingUser: any,
    dto: WishListItemsBodyDto,
  ): Promise<DataResponse<WishList>> {
    const { lang } = dto;
    const { userId } = requestingUser;

    const wishList = await this.wishListModel.findOne({ user: userId });

    if (!wishList) {
      throw new NotFoundException(getMessage('wishList_notFound', lang));
    }

    if (wishList.products.length === 0) {
      throw new BadRequestException(
        getMessage('wishList_wishListWithNoItems', lang),
      );
    }

    // Store product IDs before clearing
    const productIds = wishList.products;

    // Clear wishlist first
    wishList.products = [];
    wishList.updatedBy = userId;
    await wishList.save();

    // Decrement favoriteCount for all products that were in wishlist
    await this.productModel.updateMany(
      {
        _id: { $in: productIds },
        favoriteCount: { $gt: 0 },
      },
      { $inc: { favoriteCount: -1 } },
    );

    return {
      isSuccess: true,
      message: getMessage('wishList_productsRemovedSuccessfully', lang),
      data: wishList,
    };
  }
}
