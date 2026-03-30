import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  UserContext,
  UserContextDocument,
} from 'src/schemas/userContext.schema';
import { WishListService } from '../wishList/wishList.service';
import { CartService } from '../cart/cart.service';
import { DataResponse } from 'src/types/service-response.type';
import { getMessage } from 'src/common/utils/translator';
import { GetUserContextQuery } from './dto/get-user-context.dto';
import { User, UserDocument } from 'src/schemas/user.schema';

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
    const userId = new Types.ObjectId(user?.userId);

    let userContext = await this.userContextModel.findOne({ userId });

    if (!userContext) {
      userContext = await this.userContextModel.create({
        userId,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    }

    // Wishlist items count
    const wishlistItemsCount =
      await this.wishlistService.countActiveWishlistItems(userId);

    // Cart items count
    const cartItemsCount = await this.cartService.countActiveCartItems(user);

    // User data
    const fullUserData = await this.userModel.findById(userId).lean();

    userContext.counters = {
      ...userContext.counters,
      wishlistItemsCount,
      cartItemsCount,
    };

    userContext.lastCalculatedAt = new Date();
    userContext.dateJoined = fullUserData?.dateJoined;

    await userContext.save();

    return {
      isSuccess: true,
      message: getMessage('userContext_contextRetrieved', query.lang),
      data: userContext.toObject(),
    };
  }
}
