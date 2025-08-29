import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { getMessage } from 'src/common/utils/translator';
import { validateUserRoleAccess } from 'src/common/utils/validateUserRoleAccess';
import { WishList, WishListDocument } from 'src/schemas/wishList.schema';
import { Locale } from 'src/types/Locale';
import { BaseResponse, DataResponse } from 'src/types/service-response.type';
import { WishListItemBodyDto } from './dto/wishlist-item.dto';
import { WishListItemsBodyDto } from './dto/wishlist-items.dto';
import { Product, ProductDocument } from 'src/schemas/product.schema';

@Injectable()
export class WishListService {
  constructor(
    @InjectModel(WishList.name)
    private readonly wishListModel: Model<WishListDocument>,

    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
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
  ): Promise<DataResponse<WishList>> {
    const { lang = 'en', limit = '10', lastId, search } = params;

    validateUserRoleAccess(requestingUser, lang);

    const query: any = { user: requestingUser.userId };

    if (lastId) {
      query._id = { $lt: new Types.ObjectId(lastId) };
    }

    // ✅ Get wishlist with paginated products
    let wishList = await this.wishListModel
      .findOne(query)
      .populate({
        path: 'products',
        match: search ? { name: new RegExp(search, 'i') } : {},
        options: {
          limit: Number(limit),
          sort: { _id: -1 },
        },
      })
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('createdBy', 'firstName lastName email _id')
      .populate('updatedBy', 'firstName lastName email _id')
      .populate('restoredBy', 'firstName lastName email _id')
      .select('-__v')
      .lean();

    if (!wishList) {
      // auto create wishlist if not exist
      wishList = await this.wishListModel.create({
        user: requestingUser.userId,
        createdBy: requestingUser.userId,
      });
      wishList = wishList.toObject();
    }

    return {
      isSuccess: true,
      message: getMessage('wishList_wishListRetrievedSuccessfully', lang),
      data: wishList,
    };
  }

  async addWishListItem(
    requestingUser: any,
    dto: WishListItemBodyDto,
  ): Promise<DataResponse<WishList>> {
    const { lang, productId } = dto;
    validateUserRoleAccess(requestingUser, lang);

    this.isValidProduct(productId, lang);

    let wishList = await this.wishListModel.findOne({
      user: requestingUser.userId,
    });

    if (!wishList) {
      wishList = await this.wishListModel.create({
        user: requestingUser.userId,
        createdBy: requestingUser.userId,
        products: [productId],
      });
    } else {
      if (!wishList.products.includes(new Types.ObjectId(productId))) {
        wishList.products.push(new Types.ObjectId(productId));
        wishList.updatedBy = requestingUser.userId;
        await wishList.save();
      } else {
        throw new BadRequestException(
          getMessage('wishList_productIsInWishList', lang),
        );
      }
    }

    return {
      isSuccess: true,
      message: getMessage('wishList_wishListRetrievedSuccessfully', lang),
      data: wishList,
    };
  }

  async removeWishListItem(
    requestingUser: any,
    dto: WishListItemBodyDto,
  ): Promise<DataResponse<WishList>> {
    const { lang, productId } = dto;

    validateUserRoleAccess(requestingUser, lang);

    await this.isValidProduct(productId, lang);

    const wishList = await this.wishListModel.findOne({
      user: requestingUser.userId,
    });

    if (!wishList) {
      throw new NotFoundException(getMessage('wishList_notFound', lang));
    }

    const productObjectId = new Types.ObjectId(productId);

    // Remove product
    const newProducts = wishList.products.filter(
      (p: any) => !p.equals(productObjectId),
    );

    // If no product was removed
    if (newProducts.length === wishList.products.length) {
      throw new BadRequestException(
        getMessage('wishList_productNotInWishList', lang),
      );
    }

    wishList.products = newProducts;
    wishList.updatedBy = requestingUser.userId;
    await wishList.save();

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

    validateUserRoleAccess(requestingUser, lang);

    const wishList = await this.wishListModel.findOne({ user: userId });

    if (!wishList) {
      throw new NotFoundException(getMessage('wishList_notFound', lang));
    }

    if (wishList.products.length === 0) {
      throw new BadRequestException(
        getMessage('wishList_wishListWithNoItems', lang),
      );
    }

    // Un-wishlist all products in one bulk update
    await this.productModel.updateMany(
      { _id: { $in: wishList.products } },
      { $set: { isWishListed: false } },
    );

    // Clear wishlist
    wishList.products = [];
    wishList.updatedBy = userId;
    await wishList.save();

    return {
      isSuccess: true,
      message: getMessage('wishList_productsRemovedSuccessfully', lang),
      data: wishList,
    };
  }
}
