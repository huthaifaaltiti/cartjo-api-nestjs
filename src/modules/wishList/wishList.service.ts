import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';
import { getMessage } from 'src/common/utils/translator';
import { validateUserRoleAccess } from 'src/common/utils/validateUserRoleAccess';
import { WishList, WishListDocument } from 'src/schemas/wishList.schema';
// import { AddWishListItemDto } from './dto/add-wishlist-item.dto';
import { Locale } from 'src/types/Locale';
import { DataResponse } from 'src/types/service-response.type';
import { AddWishListItemBodyDto } from './dto/add-wishlist-item.dto';

@Injectable()
export class WishListService {
  constructor(
    @InjectModel(WishList.name)
    private readonly wishListModel: Model<WishListDocument>,
  ) {}

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

    const query: any = { user: requestingUser._id };

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

  async addWishListItem(requestingUser: any, dto: AddWishListItemBodyDto) {
    const { lang, productId } = dto;
    validateUserRoleAccess(requestingUser, lang);

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

  // // ✅ Remove single product
  // async removeWishListItem(user: any, productId: string) {
  //   const wishList = await this.wishListModel.findOne({ user: user._id });
  //   if (!wishList) throw new NotFoundException('Wishlist not found');

  //   wishList.products = wishList.products.filter(
  //     p => p.toString() !== productId,
  //   );
  //   wishList.updatedBy = user._id;
  //   await wishList.save();

  //   return {
  //     isSuccess: true,
  //     message: 'Product removed from wishlist successfully',
  //   };
  // }

  // // ✅ Remove all wishlist items
  // async removeAllWishListItems(user: any) {
  //   const wishList = await this.wishListModel.findOne({ user: user._id });
  //   if (!wishList) throw new NotFoundException('Wishlist not found');

  //   wishList.products = [];
  //   wishList.updatedBy = user._id;
  //   await wishList.save();

  //   return {
  //     isSuccess: true,
  //     message: 'All products removed from wishlist successfully',
  //   };
  // }
}
