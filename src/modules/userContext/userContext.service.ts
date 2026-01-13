import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartDocument } from 'src/schemas/cart.schema';
import {
  UserContext,
  UserContextDocument,
} from 'src/schemas/userContext.schema';
import { WishList, WishListDocument } from 'src/schemas/wishList.schema';

@Injectable()
export class UserContextService {
  constructor(
    @InjectModel(UserContext.name)
    private readonly userContextModel: Model<UserContextDocument>,

    @InjectModel(WishList.name)
    private readonly wishListModel: Model<WishListDocument>,

    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
  ) {}

  async getUserContext({ user }: { user: any }) {
    const userId = new Types.ObjectId(user._id);

    let userContext = await this.userContextModel.findOne({ userId });

    if (!userContext) {
      userContext = await this.userContextModel.create({
        userId,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePic: user.profilePic,
      });
    }

    // Wishlist count
    const wishlistItemsCount = await this.wishListModel.countDocuments({
      userId,
      isDeleted: false,
      isActive: true,
      
    });

    // Cart items count
    const cartItemsCount = await this.cartModel.countDocuments({
      userId,
      isDeleted: false,
      isActive: true,
    });

    userContext.counters = {
      ...userContext.counters,
      wishlistItemsCount,
      cartItemsCount,
    };

    userContext.lastCalculatedAt = new Date();

    await userContext.save();

    return userContext.toObject();
  }
}
