import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Cart, CartDocument } from 'src/schemas/cart.schema';
import { Order, OrderDocument } from 'src/schemas/order.schema';
import { PaymentStatus } from 'src/enums/paymentStatus.enum';
import { PaymentMethod } from 'src/enums/paymentMethod.enum';
import { ShippingAddressDto } from '../payment/dto/checkout.dto';
import { generateRandomString } from 'src/common/utils/generateRandomString';
import { validateUserRoleAccess } from 'src/common/utils/validateUserRoleAccess';
import { getMessage } from 'src/common/utils/translator';
import {
  DataListResponse,
  DataResponse,
} from 'src/types/service-response.type';
import {
  DeleteOrderBodyDto,
  DeleteOrderParamsDto,
} from './dto/deleteOrder.dto';
import {
  RestoreOrderBodyDto,
  RestoreOrderParamsDto,
} from './dto/restoreOrder.dto';
import { ChangePaymentStatusBodyDto } from './dto/paymentStatus.dto';
import { GetOrdersQueryDto } from './dto/getOrders.dto';
import { GetOrderParamDto, GetOrderQueryDto } from './dto/getOrder.dto';
import { checkUserRole } from 'src/common/utils/checkUserRole';
import { UserRole } from 'src/enums/user-role.enum';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,

    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
  ) {}

  async getUserCart(requestingUser: any) {
    const cartDoc = await this.cartModel.findOne({
      userId: requestingUser.userId,
    });

    if (!cartDoc) throw new BadRequestException('Cart not found');
    if (!cartDoc.items || cartDoc.items.length === 0)
      throw new BadRequestException('Cart is empty');

    return cartDoc;
  }

  async createOrderAndClearCart(
    user: any,
    cart: CartDocument,
    amount: number,
    currency: string,
    customerEmail: string,
    merchantReference: string,
    transactionId: string | null,
    paymentMethod: PaymentMethod,
    shippingAddress: ShippingAddressDto,
  ): Promise<Order> | null {
    if (
      !checkUserRole({
        userRole: user?.role,
        requiredRole: UserRole.USER,
      })
    ) {
      return null;
    }

    const finalTransactionId =
      paymentMethod === PaymentMethod.CASH
        ? `CASH-${generateRandomString(10)}`
        : transactionId;

    const finalPaymentStatus =
      paymentMethod === PaymentMethod.CARD
        ? PaymentStatus.PAID
        : PaymentStatus.PENDING;

    const order = await this.orderModel.create({
      userId: user?._id,
      items: cart.items.map(item => ({
        productId: item.productId,
        price: item.price,
        quantity: item.quantity,
        name: item.name,
      })),
      amount,
      currency,
      paymentStatus: finalPaymentStatus,
      paymentMethod,
      transactionId: finalTransactionId,
      email: customerEmail,
      merchantReference,
      shippingAddress,
    });

    // Clear the cart
    cart.items = [];
    await cart.save();

    return order;
  }

  async changePaidStatus(
    requestingUser: any,
    dto: ChangePaymentStatusBodyDto,
  ): Promise<DataResponse<Order>> {
    const { orderId, lang, status } = dto;
    
    validateUserRoleAccess(requestingUser, lang);

    const isStatusPaid = status === PaymentStatus.PAID;

    const order = await this.orderModel.findById(orderId);

    if (!order) {
      throw new BadRequestException(getMessage('order_orderNotFound', lang));
    }

    isStatusPaid
      ? (order.paymentStatus = PaymentStatus.PAID)
      : (order.paymentStatus = PaymentStatus.PENDING);

    order.updatedBy = requestingUser.userId;
    order.updatedAt = new Date();
    order.isUpdated = true;

    await order.save();

    return {
      isSuccess: true,
      message: getMessage(
        isStatusPaid
          ? 'order_orderMarkedPaidSuccessfully'
          : 'order_orderMarkedUnPaidSuccessfully',
        lang,
      ),
      data: order,
    };
  }

  async softDeleteOrder(
    requestingUser: any,
    body: DeleteOrderBodyDto,
    param: DeleteOrderParamsDto,
  ): Promise<DataResponse<Order>> {
    const { lang } = body;
    const { id } = param;

    validateUserRoleAccess(requestingUser, lang);

    const order = await this.orderModel.findById(id);

    if (!order) {
      throw new BadRequestException(getMessage('order_orderNotFound', lang));
    }

    if (order.isDeleted) {
      return {
        isSuccess: true,
        message: getMessage('order_alreadyDeleted', lang),
        data: order,
      };
    }

    order.isDeleted = true;
    order.deletedAt = new Date();
    order.deletedBy = requestingUser.userId;
    order.updatedAt = new Date();
    order.isUpdated = true;

    await order.save();

    return {
      isSuccess: true,
      message: getMessage('order_deletedSuccessfully', lang),
      data: order,
    };
  }

  async restoreOrder(
    requestingUser: any,
    body: RestoreOrderBodyDto,
    param: RestoreOrderParamsDto,
  ): Promise<DataResponse<Order>> {
    const { lang } = body;
    const { id } = param;

    validateUserRoleAccess(requestingUser, lang);

    const order = await this.orderModel.findById(id);

    if (!order) {
      throw new BadRequestException(getMessage('order_orderNotFound', lang));
    }

    if (!order.isDeleted) {
      return {
        isSuccess: true,
        message: getMessage('order_notDeleted', lang),
        data: order,
      };
    }

    order.isDeleted = false;
    order.restoredAt = new Date();
    order.restoredBy = requestingUser.userId;
    order.updatedAt = new Date();
    order.isUpdated = true;

    await order.save();

    return {
      isSuccess: true,
      message: getMessage('order_restoredSuccessfully', lang),
      data: order,
    };
  }

  async getAll(
    requestingUser: any,
    params: GetOrdersQueryDto,
  ): Promise<DataListResponse<Order>> {
    const { lang = 'en', limit = 10, lastId, search } = params;

    validateUserRoleAccess(requestingUser, lang);

    const query: any = { isDeleted: false };

    if (lastId) {
      query._id = { $lt: new Types.ObjectId(lastId) };
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');

      query.$or = [
        { transactionId: searchRegex },
        { email: searchRegex },
        { merchantReference: searchRegex },
        { userId: search }, // exact match because ObjectId cannot be regex-based
      ];
    }

    const orders = await this.orderModel
      .find(query)
      .sort({ _id: -1 })
      .limit(Number(limit))
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('restoredBy', 'firstName lastName email _id')
      .populate('createdBy', 'firstName lastName email _id')
      .populate('updatedBy', 'firstName lastName email _id')
      .select('-__v')
      .lean();

    return {
      isSuccess: true,
      message: getMessage('order_ordersRetrievedSuccessfully', lang),
      dataCount: orders.length,
      data: orders,
    };
  }

  async getOne(
    req: any,
    param: GetOrderParamDto,
    query: GetOrderQueryDto,
  ): Promise<DataResponse<Order>> {
    const { user } = req;
    const { lang } = query;
    const { id } = param;

    validateUserRoleAccess(user, lang);

    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(getMessage('order_invalidId', lang));
    }

    const order = await this.orderModel
      .findById(id)
      .populate('deletedBy', 'firstName lastName email _id')
      .populate('restoredBy', 'firstName lastName email _id')
      .populate('createdBy', 'firstName lastName email _id')
      .populate('updatedBy', 'firstName lastName email _id')
      .populate({
        path: 'items.productId',
        select: 'name currency ratings description mainImage',
      })
      .lean();

    if (!order) {
      throw new NotFoundException(getMessage('order_notFound', lang));
    }

    return {
      isSuccess: true,
      message: getMessage('order_orderRetrieved', lang),
      data: order,
    };
  }
}
