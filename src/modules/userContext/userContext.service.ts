import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UserContext,
  UserContextDocument,
} from 'src/schemas/userContext.schema';
import { WishListService } from '../wishList/wishList.service';
import { Product } from 'src/schemas/product.schema';
import { CartService } from '../cart/cart.service';
import { DataResponse } from 'src/types/service-response.type';
import { getMessage } from 'src/common/utils/translator';
import { GetUserContextQuery } from './dto/get-user-context.dto';
import { User, UserDocument } from 'src/schemas/user.schema';
import { CartItem } from 'src/schemas/cart.schema';

@Injectable()
export class UserContextService {
  constructor(
    @InjectModel(UserContext.name)
    private readonly userContextModel: Model<UserContextDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly cartService: CartService,
    private readonly wishlistService: WishListService,
  ) {}

  async getUserContext({
    user,
    query,
  }: {
    user: any;
    query: GetUserContextQuery;
  }): Promise<DataResponse<any>> {
    const userId = user?.userId;

    let userContext = await this.userContextModel.findOne({ userId });

    if (!userContext) {
      userContext = await this.userContextModel.create({
        userId,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    }

    // Wishlist
    const wishlist = await this.wishlistService.getWishList(user, {});
    const wishlistItems = wishlist?.data?.products ?? [];
    const wishlistItemsCount =
      wishlistItems.filter((i: Product) => i.isActive && !i.isDeleted).length ??
      0;

    // Cart
    const cart = await this.cartService.getCart(user, {});
    const cartItems = cart?.data?.items ?? [];
    const cartItemsCount = cartItems
      .filter((i: Product) => i.isActive && !i.isDeleted)
      .reduce((acc: number, i: CartItem) => acc + (i.quantity || 0), 0);

    const fullUserData = await this.userModel.findOne({
      email: user.email,
    });

    userContext.counters = {
      ...userContext.counters,
      wishlistItemsCount,
      cartItemsCount,
    };

    userContext.lastCalculatedAt = new Date();
    userContext.dateJoined = fullUserData.dateJoined;

    await userContext.save();

    const userContextData = userContext.toObject();

    return {
      isSuccess: true,
      message: getMessage('userContext_contextRetrieved', query.lang),
      data: userContextData,
    };
  }
}
