import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import axios from 'axios';
import { Locale } from 'src/types/Locale';
import { ItemBodyDto } from './dto/item.dto';
import { CheckoutBodyDto } from './dto/checkout.dto';
import { Currency } from 'src/enums/currency.enum';
import { getMessage } from 'src/common/utils/translator';
import { Product, ProductDocument } from 'src/schemas/product.schema';
import { Cart, CartDocument } from 'src/schemas/cart.schema';
import { DataResponse } from 'src/types/service-response.type';
import { DeleteAllItemsBodyDto } from './dto/delete.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  private readonly accessCode = process.env.APS_PAY_FORT_ACCESS_CODE;
  private readonly merchantIdentifier =
    process.env.APS_PAY_FORT_MERCHANT_IDENTIFIER;
  private readonly shaRequestPhrase =
    process.env.APS_PAY_FORT_SHA_REQUEST_PHRASE;
  private readonly shaResponsePhrase =
    process.env.APS_PAY_FORT_SHA_RESPONSE_PHRASE;
  private readonly paymentApiUrl = process.env.APS_PAY_FORT_PAYMENT_API_URL;

  // Generate APS signature
  private generateSignature(params: Record<string, any>): string {
    const sortedKeys = Object.keys(params).sort();
    const signatureString =
      this.shaRequestPhrase +
      sortedKeys.map(k => `${k}=${params[k]}`).join('') +
      this.shaRequestPhrase;

    return crypto.createHash('sha256').update(signatureString).digest('hex');
  }

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

  // Convert JOD → minor units
  toMinorUnits(amount: number, currency: string): number {
    let multiplier = 100; // default for 2-decimal currencies

    if (currency === Currency.JOD) multiplier = 1000;
    else if (currency === Currency.USD) multiplier = 100;

    let minor = Math.round(amount * multiplier);

    // If JOD, ensure last digit is 0 (VISA requirement)
    if (currency === Currency.JOD) {
      minor = Math.round(minor / 10) * 10;
    }

    return minor;
  }

  async processPayment(
    requestingUser: any,
    dto: CheckoutBodyDto,
  ): Promise<DataResponse<any>> {
    const { lang, token_name: tokenName, currency } = dto;

    const cart = await this.cartModel.findOne({
      userId: requestingUser.userId,
    });

    if (!cart || !cart.items.length)
      throw new BadRequestException(getMessage('cart_cartWithNoItems', lang));

    const amount = this.toMinorUnits(cart.totalAmount, currency);
    const merchantReference = `ORD-${Date.now()}`;

    const paymentData = {
      command: 'PURCHASE',
      access_code: this.accessCode,
      merchant_identifier: this.merchantIdentifier,
      merchant_reference: merchantReference,
      amount,
      currency,
      language: lang || 'en',
      customer_email: requestingUser.email,
      token_name: tokenName,
    };

    const signature = this.generateSignature(paymentData);
    const payload = { ...paymentData, signature };

    try {
      const { data } = await axios.post(this.paymentApiUrl, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (data.status === '14') {
        // Success
        cart.items = [];
        cart.totalAmount = 0;

        await cart.save();
      }

      return {
        isSuccess: true,
        message: getMessage('cart_paymentProcessed', lang),
        data,
      };
    } catch (error) {
      throw new BadRequestException(error?.response?.data || 'Payment failed');
    }
  }
}
