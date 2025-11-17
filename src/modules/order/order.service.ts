import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Cart, CartDocument } from 'src/schemas/cart.schema';
import { Order, OrderDocument } from 'src/schemas/order.schema';
import { PaymentStatus } from 'src/enums/paymentStatus.enum';
import { PaymentMethod } from 'src/enums/paymentMethod.enum';
import { ShippingAddressDto } from '../payment/dto/checkout.dto';


@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Cart.name)
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) {}

   async createOrderAndClearCart(
    userId: string,
    cart: CartDocument,
    amount: number,
    currency: string,
    customerEmail: string,
    merchantReference: string,
    transactionId: string,
    paymentMethod: PaymentMethod,
    shippingAddress: ShippingAddressDto,
  ) {
    const order = await this.orderModel.create({
      userId,
      items: cart.items.map(item => ({
        productId: item.productId,
        price: item.price,
        quantity: item.quantity,
      })),
      amount,
      currency,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod,
      transactionId,
      email: customerEmail,
      merchantReference,
      shippingAddress
    });

    // Clear the cart
    cart.items = [];
    await cart.save();

    return order;
  }
}
