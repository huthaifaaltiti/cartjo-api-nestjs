import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Locale } from 'src/types/Locale';
import { ItemBodyDto } from './dto/item.dto';
import { getMessage } from 'src/common/utils/translator';
import { Product, ProductDocument } from 'src/schemas/product.schema';
import { Cart, CartDocument } from 'src/schemas/cart.schema';
import { DataResponse } from 'src/types/service-response.type';
import { DeleteAllItemsBodyDto } from './dto/delete.dto';
import { WishList, WishListDocument } from 'src/schemas/wishList.schema';
import { WishlistItemsBodyDto } from './dto/items.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(WishList.name)
    private readonly wishlistModel: Model<WishListDocument>,
  ) {}

  async isValidProduct(prodId: mongoose.Types.ObjectId, lang: Locale) {
    const product = await this.productModel.findById(prodId);

    if (!product)
      throw new NotFoundException(getMessage('cart_notFoundProduct', lang));

    return product;
  }

  async getCart(
    requestingUser: any,
    params: {
      lang?: Locale;
      limit?: number;
      lastId?: string;
      search?: string;
    },
  ): Promise<DataResponse<any>> {
    const { lang = 'en', limit = 10, lastId, search } = params;

    let cart = await this.cartModel
      .findOne({ userId: requestingUser.userId })
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('createdBy', 'firstName lastName email _id')
      .populate('updatedBy', 'firstName lastName email _id')
      .populate('restoredBy', 'firstName lastName email _id')
      .lean();

    // If user has no cart, create one
    if (!cart) {
      const newCart = await this.cartModel.create({
        userId: requestingUser.userId,
        createdBy: requestingUser.userId,
      });

      cart = newCart.toObject();
    }

    if (!cart.items || cart.items.length === 0) {
      return {
        isSuccess: true,
        message: getMessage('cart_cartRetrievedSuccessfully', lang),
        data: {
          ...cart,
          itemsCount: 0,
          items: [],
        },
      };
    }

    const productIds = cart.items.map(i => i.productId);

    const query: any = {
      _id: { $in: productIds },
      isDeleted: { $ne: true },
      isActive: true,
    };

    if (search) {
      query.$or = [
        { 'name.en': new RegExp(search, 'i') },
        { 'name.ar': new RegExp(search, 'i') },
      ];
    }

    if (lastId) {
      query._id.$lt = new Types.ObjectId(lastId);
    }

    const totalItemsCount = await this.productModel.countDocuments(query);

    const products = await this.productModel
      .find(query)
      .sort({ _id: -1 })
      .limit(Number(limit))
      .lean();

    // Merge product details with quantity/price
    const enrichedItems = products.map(product => {
      const cartItem = cart.items.find(
        i => i.productId.toString() === product._id.toString(),
      );
      return {
        ...product,
        quantity: cartItem?.quantity ?? 1,
        price: cartItem?.price ?? 0,
        total: (cartItem?.quantity ?? 1) * (cartItem?.price ?? 0),
      };
    });

    return {
      isSuccess: true,
      message: getMessage('cart_cartRetrievedSuccessfully', lang),
      data: {
        ...cart,
        itemsCount: totalItemsCount,
        items: enrichedItems,
      },
    };
  }

  async addCartItem(
    requestingUser: any,
    dto: ItemBodyDto,
  ): Promise<DataResponse<Cart>> {
    const { lang, productId, quantity } = dto;
    const product = await this.isValidProduct(productId, lang);

    const price = product.price ?? 0;

    let cart = await this.cartModel.findOne({
      userId: requestingUser.userId,
    });

    if (!cart) {
      cart = await this.cartModel.create({
        userId: requestingUser.userId,
        createdBy: requestingUser.userId,
        items: [{ productId, quantity, price }],
        totalAmount: price * quantity,
      });
    } else {
      const existingItem = cart.items.find(i => i.productId.equals(productId));

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, quantity, price });
      }

      cart.totalAmount = cart.items.reduce(
        (sum, i) => sum + i.quantity * i.price,
        0,
      );

      cart.updatedBy = requestingUser.userId;

      await cart.save();
    }

    return {
      isSuccess: true,
      message: getMessage('cart_productAddedSuccessfully', lang),
      data: cart,
    };
  }

  async removeCartItem(
    requestingUser: any,
    dto: ItemBodyDto,
  ): Promise<DataResponse<Cart>> {
    const { lang, productId, quantity } = dto;

    await this.isValidProduct(productId, lang);

    const cart = await this.cartModel.findOne({
      userId: requestingUser.userId,
    });

    if (!cart) throw new NotFoundException(getMessage('cart_notFound', lang));

    const itemIndex = cart.items.findIndex(i => i.productId.equals(productId));
    const item = cart.items.at(itemIndex);

    if (itemIndex === -1)
      throw new BadRequestException(getMessage('cart_productNotInCart', lang));

    if (quantity >= item.quantity) {
      cart.items.splice(itemIndex, 1);
    } else {
      item.quantity -= quantity;
    }

    cart.totalAmount = cart.items.reduce(
      (sum, i) => sum + i.quantity * i.price,
      0,
    );

    cart.updatedBy = requestingUser.userId;

    await cart.save();

    return {
      isSuccess: true,
      message: getMessage('cart_productRemovedSuccessfully', lang),
      data: cart,
    };
  }

  async removeAllCartItems(
    requestingUser: any,
    dto: DeleteAllItemsBodyDto,
  ): Promise<DataResponse<Cart>> {
    const { userId } = requestingUser;
    const { lang } = dto;

    const cart = await this.cartModel.findOne({ userId });
    if (!cart) throw new NotFoundException(getMessage('cart_notFound', lang));

    if (!cart.items.length) {
      throw new BadRequestException(getMessage('cart_cartWithNoItems', lang));
    }

    cart.items = [];
    cart.totalAmount = 0;
    cart.updatedBy = userId;

    await cart.save();

    return {
      isSuccess: true,
      message: getMessage('cart_clearedSuccessfully', lang),
      data: cart,
    };
  }

  async wishlistItems(
    requestingUser: any,
    dto: WishlistItemsBodyDto,
  ): Promise<DataResponse<any>> {
    const { lang = 'en' } = dto;

    const cart = await this.cartModel.findOne({
      userId: requestingUser.userId,
    });

    if (!cart) throw new NotFoundException(getMessage('cart_notFound', lang));
    if (!cart.items.length)
      throw new BadRequestException(getMessage('cart_cartWithNoItems', lang));

    let wishlist = await this.wishlistModel.findOne({
      user: requestingUser.userId,
    });

    if (!wishlist) {
      wishlist = await this.wishlistModel.create({
        user: requestingUser.userId,
        createdBy: requestingUser.userId,
        products: [],
      });
    }

    const movedItems: any[] = [];

    for (const cartItem of cart.items) {
      const productId = cartItem.productId.toString();

      const exists = wishlist.products.some(p => p.toString() === productId);

      if (!exists) {
        wishlist.products.push(cartItem.productId);
        movedItems.push(cartItem.productId);
      }
    }

    await wishlist.save();

    cart.items = [];
    cart.totalAmount = 0;

    await cart.save();

    return {
      isSuccess: true,
      message: getMessage('cart_itemsMovedToWishlist', lang),
      data: movedItems,
    };
  }
}
