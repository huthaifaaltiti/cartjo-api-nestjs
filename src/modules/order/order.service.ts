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
import { EmailService } from '../email/email.service';
import { EmailTemplates } from 'src/enums/emailTemplates.enum';
import { PreferredLanguage } from 'src/enums/preferredLanguage.enum';
import { ExportFormat } from 'src/enums/ExportFormat.enum';
import { ExportOrdersQueryDto } from './dto/exportOrders.dto';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';
import { Response } from 'express';
import { getAppUrl } from 'src/common/utils/getAppUrl';
import commonEmailTemplateData from 'src/common/utils/commonEmailTemplateData';
import { CreateOrderBodyDto } from './dto/createOrder.dto';
import getCurrencyLabel from 'src/common/utils/getCurrencyLabel';
import getPaymentMethodLabel from 'src/common/utils/getPaymentMethodLabel';
import {
  GetMyOrdersParamDto,
  GetMyOrdersQueryDto,
} from './dto/getMyOrders.dto';
import { validateSameUserAccess } from 'src/common/utils/validateSameUserAccess';
import { GetMyOrderParamDto, GetMyOrderQueryDto } from './dto/getMyOrder.dto';
import { ChangeDeliveryStatusBodyDto } from './dto/deliveryStatus.dto';
import { OrderDeliveryStatus } from 'src/enums/orderDeliveryStatus.enum';
import { User } from 'src/schemas/user.schema';
import { GetMyOrderReturnsParamDto, GetMyOrderReturnsQueryDto } from './dto/getMyOrderReturns.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
    private readonly emailService: EmailService,
  ) {}

  private sendDeliveryEmailTemplate({
    status,
    user,
    order,
  }: {
    status: OrderDeliveryStatus;
    user: User;
    order: Order;
  }) {
    const DeliveryStatusEmailMap: Partial<
      Record<OrderDeliveryStatus, EmailTemplates>
    > = {
      [OrderDeliveryStatus.SHIPPED]: EmailTemplates.ORDER_SHIPPED,
      [OrderDeliveryStatus.OUT_FOR_DELIVERY]:
        EmailTemplates.ORDER_OUT_FOR_DELIVERY,
      [OrderDeliveryStatus.DELIVERED]: EmailTemplates.ORDER_DELIVERED,
      [OrderDeliveryStatus.FAILED]: EmailTemplates.ORDER_DELIVERY_FAILED,
      [OrderDeliveryStatus.CANCELED]: EmailTemplates.ORDER_CANCELED,
      [OrderDeliveryStatus.RETURNED]: EmailTemplates.ORDER_RETURNED,
    };

    const template = DeliveryStatusEmailMap[status];

    if (template && user?.email) {
      const orderId =
        order.merchantReference || order.transactionId || order._id;

      const preferredLang = user.preferredLang ?? PreferredLanguage.ARABIC;

      const orderUrl = `${getAppUrl()}/${preferredLang}/user/orders?sq=${order?.merchantReference || order?._id}`;

      this.emailService.sendTemplateEmail({
        to: user.email,
        templateName: template,
        templateData: {
          firstName: user.firstName,
          orderId,
          amount: order.amount,
          currency: getCurrencyLabel(preferredLang, order.currency),
          orderUrl,
          ...commonEmailTemplateData(),
        },
        prefLang: preferredLang,
      });
    }
  }

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
    body: CreateOrderBodyDto,
  ): Promise<DataResponse<Order>> {
    const {
      amount,
      currency,
      email,
      merchantReference,
      transactionId,
      paymentMethod,
      shippingAddress,
      lang,
    } = body;
    if (
      !checkUserRole({
        userRole: user?.role,
        requiredRole: UserRole.USER,
      })
    ) {
      throw new BadRequestException(getMessage('orders_cantCreateOrder', lang));
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
      userId: user?.userId,
      createdBy: user?.userId,
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
      email,
      merchantReference,
      shippingAddress,
    });

    if (user?.email && order) {
      const { amount, _id, merchantReference, transactionId } = order;
      const orderId = merchantReference ?? transactionId ?? _id;

      const preferredLang = user.preferredLang ?? PreferredLanguage.ARABIC;

      const orderUrl = `${getAppUrl()}/${preferredLang}/user/orders?sq=${merchantReference || _id}`;

      this.emailService.sendTemplateEmail({
        to: user.email,
        templateName: EmailTemplates.ORDER_CREATED,
        templateData: {
          firstName: user.firstName,
          orderId,
          amount,
          currency: getCurrencyLabel(preferredLang, body.currency),
          paymentMethod: getPaymentMethodLabel(
            preferredLang,
            body.paymentMethod,
          ),
          orderUrl,
          ...commonEmailTemplateData(),
        },
        prefLang: preferredLang,
      });
    }

    // Clear the cart
    cart.items = [];
    await cart.save();

    const responseMessage =
      order.paymentMethod === PaymentMethod.CASH
        ? 'order_cashOrderCreatedSuccessfully'
        : 'order_cardOrderCreatedSuccessfully';

    return {
      isSuccess: true,
      message: getMessage(responseMessage, lang),
      data: order,
    };
  }

  async changeDeliveryStatus(
    requestingUser: any,
    dto: ChangeDeliveryStatusBodyDto,
  ): Promise<DataResponse<Order>> {
    const { orderId, lang, status } = dto;

    validateUserRoleAccess(requestingUser, lang);

    const order = await this.orderModel.findById(orderId);

    if (!order || order.isDeleted) {
      throw new BadRequestException(getMessage('order_orderNotFound', lang));
    }

    // Hard stop: delivered or canceled orders
    if (order.isDelivered) {
      throw new BadRequestException(getMessage('order_deliveredOrder', lang));
    }

    if (order.deliveryStatus === OrderDeliveryStatus.CANCELED) {
      throw new BadRequestException(getMessage('order_canceledOrder', lang));
    }

    /**
     * ✅ Allowed delivery status transitions
     * (works for INTERNAL & OUTSOURCED)
     * This object is a delivery status rule map.

        It answers one question only:

        👉 “From the current delivery status, which next statuses are allowed?”

        This prevents invalid jumps like:

        PENDING → DELIVERED ❌

        DELIVERED → SHIPPED ❌

        CANCELED → ANYTHING ❌

        Means:

         Key → current delivery status

         Value → list of statuses you’re allowed to move to next
     */
    const allowedTransitions: Record<
      OrderDeliveryStatus,
      OrderDeliveryStatus[]
    > = {
      PENDING: [OrderDeliveryStatus.CONFIRMED, OrderDeliveryStatus.CANCELED],
      CONFIRMED: [OrderDeliveryStatus.PREPARING, OrderDeliveryStatus.CANCELED],
      PREPARING: [OrderDeliveryStatus.SHIPPED],
      SHIPPED: [
        OrderDeliveryStatus.OUT_FOR_DELIVERY,
        OrderDeliveryStatus.FAILED,
      ],
      OUT_FOR_DELIVERY: [
        OrderDeliveryStatus.DELIVERED,
        OrderDeliveryStatus.FAILED,
      ],
      FAILED: [OrderDeliveryStatus.RETURNED],
      RETURNED: [],
      DELIVERED: [],
      CANCELED: [],
    };

    const currentStatus = order.deliveryStatus;

    if (currentStatus && !allowedTransitions[currentStatus]?.includes(status)) {
      throw new BadRequestException(
        getMessage('order_invalidDeliveryStatusTransition', lang),
      );
    }

    order.deliveryStatus = status;

    if (status === OrderDeliveryStatus.DELIVERED) {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    } else {
      order.isDelivered = false;
      order.deliveredAt = null;
    }

    order.updatedBy = requestingUser.userId;
    order.updatedAt = new Date();
    order.isUpdated = true;

    await order.save();

    if (
      status === OrderDeliveryStatus.SHIPPED ||
      status === OrderDeliveryStatus.OUT_FOR_DELIVERY ||
      status === OrderDeliveryStatus.DELIVERED ||
      status === OrderDeliveryStatus.FAILED ||
      status === OrderDeliveryStatus.CANCELED ||
      status === OrderDeliveryStatus.RETURNED
    ) {
      this.sendDeliveryEmailTemplate({ status, user: requestingUser, order });
    }

    return {
      isSuccess: true,
      message: getMessage('order_deliveryStatusUpdatedSuccessfully', lang),
      data: order,
    };
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

    if (order.isDelivered) {
      throw new BadRequestException(getMessage('order_deliveredOrder', lang));
    }

    if (order.deliveryStatus === OrderDeliveryStatus.CANCELED) {
      throw new BadRequestException(getMessage('order_canceledOrder', lang));
    }

    if (isStatusPaid) {
      order.paymentStatus = PaymentStatus.PAID;
      order.isPaid = true;
      order.paidAt = new Date();
    } else {
      order.isPaid = false;
      order.paymentStatus = status;
    }

    order.updatedBy = requestingUser.userId;
    order.updatedAt = new Date();
    order.isUpdated = true;

    await order.save();

    return {
      isSuccess: true,
      message: getMessage(
        isStatusPaid
          ? 'order_orderMarkedPaidSuccessfully'
          : 'order_orderPaymentStatusChanged',
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

  async getMyOrders(
    requestingUser: any,
    query: GetMyOrdersQueryDto,
    param: GetMyOrdersParamDto,
  ): Promise<DataListResponse<Order>> {
    const {
      lang = 'en',
      limit = 10,
      lastId,
      search,
      amountMin,
      amountMax,
      paymentStatus,
      paymentMethod,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
    } = query;
    const { uid } = param;

    validateSameUserAccess(
      requestingUser?.userId?.toString(),
      uid?.toString(),
      lang,
    );
    validateUserRoleAccess(requestingUser, lang);

    const dbQuery: any = { isDeleted: false, userId: uid };

    if (lastId) {
      dbQuery._id = { $lt: new Types.ObjectId(lastId) };
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      dbQuery.$or = [
        { transactionId: searchRegex },
        { merchantReference: searchRegex },
        {
          _id: Types.ObjectId.isValid(search)
            ? new Types.ObjectId(search)
            : undefined,
        },
      ].filter(Boolean);
    }

    /*
    The issue is that _id (or userId) should only be added to $or when the search value is a valid ObjectId. Putting undefined inside $or is risky and unclear.

Here’s the clean, safe, and idiomatic MongoDB/Mongoose way to handle it.

✅ Correct & clean implementation
if (search) {
  const searchRegex = new RegExp(search, 'i');

  const orConditions: any[] = [
    { transactionId: searchRegex },
    { merchantReference: searchRegex },
    { email: searchRegex },
  ];

  // Handle ObjectId search (_id or userId)
  if (Types.ObjectId.isValid(search)) {
    orConditions.push({ userId: new Types.ObjectId(search) });
    // or if you want order _id:
    // orConditions.push({ _id: new Types.ObjectId(search) });
  }

  dbQuery.$or = orConditions;
}

    */

    // Filter by amount range
    if (amountMin !== undefined || amountMax !== undefined) {
      dbQuery.amount = {};
      if (amountMin !== undefined) dbQuery.amount.$gte = Number(amountMin);
      if (amountMax !== undefined) dbQuery.amount.$lte = Number(amountMax);
    }

    // Filter by paymentStatus
    if (paymentStatus) {
      dbQuery.paymentStatus = paymentStatus;
    }

    // Filter by paymentMethod
    if (paymentMethod) {
      dbQuery.paymentMethod = paymentMethod;
    }

    // Filter by creation time
    if (createdAfter || createdBefore) {
      dbQuery.createdAt = {};
      if (createdAfter) dbQuery.createdAt.$gte = new Date(createdAfter);
      if (createdBefore) dbQuery.createdAt.$lte = new Date(createdBefore);
    }

    // Filter by update time
    if (updatedAfter || updatedBefore) {
      dbQuery.updatedAt = {};
      if (updatedAfter) dbQuery.updatedAt.$gte = new Date(updatedAfter);
      if (updatedBefore) dbQuery.updatedAt.$lte = new Date(updatedBefore);
    }

    const orders = await this.orderModel
      .find(dbQuery)
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

  async getMyOrderReturns(
    requestingUser: any,
    query: GetMyOrderReturnsQueryDto,
    param: GetMyOrderReturnsParamDto,
  ): Promise<DataListResponse<Order>> {
    const {
      lang = 'en',
      limit = 10,
      lastId,
      search,
      amountMin,
      amountMax,
      paymentStatus,
      paymentMethod,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
    } = query;
    const { uid } = param;

    validateSameUserAccess(
      requestingUser?.userId?.toString(),
      uid?.toString(),
      lang,
    );
    validateUserRoleAccess(requestingUser, lang);

    const dbQuery: any = {
      isDeleted: false,
      userId: uid,
      deliveryStatus: OrderDeliveryStatus.RETURNED,
    };

    if (lastId) {
      dbQuery._id = { $lt: new Types.ObjectId(lastId) };
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      dbQuery.$or = [
        { transactionId: searchRegex },
        { merchantReference: searchRegex },
        {
          _id: Types.ObjectId.isValid(search)
            ? new Types.ObjectId(search)
            : undefined,
        },
      ].filter(Boolean);
    }

    // Filter by amount range
    if (amountMin !== undefined || amountMax !== undefined) {
      dbQuery.amount = {};
      if (amountMin !== undefined) dbQuery.amount.$gte = Number(amountMin);
      if (amountMax !== undefined) dbQuery.amount.$lte = Number(amountMax);
    }

    // Filter by paymentStatus
    if (paymentStatus) {
      dbQuery.paymentStatus = paymentStatus;
    }

    // Filter by paymentMethod
    if (paymentMethod) {
      dbQuery.paymentMethod = paymentMethod;
    }

    // Filter by creation time
    if (createdAfter || createdBefore) {
      dbQuery.createdAt = {};
      if (createdAfter) dbQuery.createdAt.$gte = new Date(createdAfter);
      if (createdBefore) dbQuery.createdAt.$lte = new Date(createdBefore);
    }

    // Filter by update time
    if (updatedAfter || updatedBefore) {
      dbQuery.updatedAt = {};
      if (updatedAfter) dbQuery.updatedAt.$gte = new Date(updatedAfter);
      if (updatedBefore) dbQuery.updatedAt.$lte = new Date(updatedBefore);
    }

    const orders = await this.orderModel
      .find(dbQuery)
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
      message: getMessage('order_ordersReturnsRetrieved', lang),
      dataCount: orders.length,
      data: orders,
    };
  }

  async getMyOrder(
    requestingUser: any,
    query: GetMyOrderQueryDto,
    param: GetMyOrderParamDto,
  ): Promise<DataResponse<Order>> {
    const { oid, uid } = param;
    const { lang } = query;

    validateSameUserAccess(
      requestingUser?.userId?.toString(),
      uid?.toString(),
      lang,
    );
    validateUserRoleAccess(requestingUser, lang);

    if (!Types.ObjectId.isValid(oid)) {
      throw new NotFoundException(getMessage('order_invalidId', lang));
    }

    const order = await this.orderModel
      .findById(oid)
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

  async getAll(
    requestingUser: any,
    params: GetOrdersQueryDto,
  ): Promise<DataListResponse<Order>> {
    const {
      lang = 'en',
      limit = 10,
      lastId,
      search,
      amountMin,
      amountMax,
      paymentStatus,
      deliveryStatus,
      paymentMethod,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
    } = params;

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

    // Filter by amount range
    if (amountMin !== undefined || amountMax !== undefined) {
      query.amount = {};
      if (amountMin !== undefined) query.amount.$gte = Number(amountMin);
      if (amountMax !== undefined) query.amount.$lte = Number(amountMax);
    }

    // Filter by paymentStatus
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    // Filter by deliveryStatus
    if (deliveryStatus) {
      query.deliveryStatus = deliveryStatus;
    }

    // Filter by paymentMethod
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    // Filter by creation time
    if (createdAfter || createdBefore) {
      query.createdAt = {};
      if (createdAfter) query.createdAt.$gte = new Date(createdAfter);
      if (createdBefore) query.createdAt.$lte = new Date(createdBefore);
    }

    // Filter by update time
    if (updatedAfter || updatedBefore) {
      query.updatedAt = {};
      if (updatedAfter) query.updatedAt.$gte = new Date(updatedAfter);
      if (updatedBefore) query.updatedAt.$lte = new Date(updatedBefore);
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

  async exportOrders(
    requestingUser: any,
    query: ExportOrdersQueryDto,
    res: Response,
  ): Promise<void> {
    const { format, startDate, endDate, lang } = query;

    validateUserRoleAccess(requestingUser, lang);

    const queryFilter: any = { isDeleted: false };

    if (startDate || endDate) {
      queryFilter.createdAt = {};
      if (startDate) queryFilter.createdAt.$gte = new Date(startDate);
      if (endDate) queryFilter.createdAt.$lte = new Date(endDate);
    }

    const orders = await this.orderModel
      .find(queryFilter)
      .populate('updatedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean();

    if (orders.length === 0) {
      throw new BadRequestException(
        getMessage('order_noOrdersFound', lang) || 'No orders found for export',
      );
    }

    const dateRange = this.formatDateRange(startDate, endDate);
    const filename = `Orders_${dateRange}`;

    if (format === ExportFormat.EXCEL) {
      await this.generateExcel(orders, filename, dateRange, res);
    } else {
      await this.generatePDF(orders, filename, dateRange, res);
    }
  }

  private formatDateRange(startDate?: string, endDate?: string): string {
    const format = (date: string) => {
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    };

    if (startDate && endDate) {
      return `${format(startDate)}_to_${format(endDate)}`;
    } else if (startDate) {
      return `from_${format(startDate)}`;
    } else if (endDate) {
      return `until_${format(endDate)}`;
    }
    return 'all_time';
  }

  private async generateExcel(
    orders: any[],
    filename: string,
    _dateRange: string,
    res: Response,
  ): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    worksheet.columns = [
      { header: 'Order ID', key: 'orderId', width: 25 },
      { header: 'Transaction ID', key: 'transactionId', width: 25 },
      { header: 'Customer Name', key: 'customerName', width: 25 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Number of Items', key: 'itemCount', width: 15 },
      { header: 'Amount', key: 'amount', width: 12 },
      { header: 'Currency', key: 'currency', width: 10 },
      { header: 'Payment Status', key: 'paymentStatus', width: 15 },
      { header: 'Payment Method', key: 'paymentMethod', width: 15 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'Order Date', key: 'orderDate', width: 20 },
      { header: 'Updated By', key: 'updatedBy', width: 20 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    orders.forEach(order => {
      worksheet.addRow({
        orderId: order._id.toString(),
        transactionId: order.transactionId || 'N/A',
        customerName: order.shippingAddress?.fullName || 'N/A',
        email: order.email || 'N/A',
        phone: order.shippingAddress?.phone || 'N/A',
        itemCount: order.items?.length || 0,
        amount: order.amount,
        currency: order.currency,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        city: order.shippingAddress?.city || 'N/A',
        orderDate: new Date(order.createdAt).toLocaleString(),
        updatedBy: order.updatedBy
          ? `${order.updatedBy.firstName} ${order.updatedBy.lastName}`
          : 'N/A',
      });
    });

    worksheet.addRow({});
    const summaryRow = worksheet.addRow({
      orderId: 'TOTAL ORDERS:',
      transactionId: orders.length,
      customerName: '',
      email: 'TOTAL AMOUNT:',
      phone: orders.reduce((sum, o) => sum + (o.amount || 0), 0),
    });
    summaryRow.font = { bold: true };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}.xlsx"`,
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  private async generatePDF(
    orders: any[],
    filename: string,
    dateRange: string,
    res: Response,
  ): Promise<void> {
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      layout: 'landscape',
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}.pdf"`,
    );

    doc.pipe(res);

    doc.fontSize(20).text('Orders Export Report', { align: 'center' });
    doc.fontSize(12).text(`Date Range: ${dateRange.replace(/_/g, ' ')}`, {
      align: 'center',
    });
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, {
      align: 'center',
    });
    doc.moveDown(2);

    const tableTop = 150;
    const itemHeight = 30;
    const colWidths = [100, 120, 80, 60, 80, 80, 60];
    let y = tableTop;

    const headers = [
      'Transaction ID',
      'Customer Name',
      'Items',
      'Amount',
      'Status',
      'Method',
      'Date',
    ];

    doc.fontSize(9).font('Helvetica-Bold');
    headers.forEach((header, i) => {
      const x = 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.text(header, x, y, { width: colWidths[i], align: 'left' });
    });

    doc
      .moveTo(50, y + 15)
      .lineTo(750, y + 15)
      .stroke();

    doc.font('Helvetica');
    y += 25;

    orders.forEach((order, index) => {
      if (y > 500) {
        doc.addPage();
        y = 50;
      }

      const row = [
        order.transactionId.toString(),
        order.shippingAddress?.fullName || 'N/A',
        order.items?.length.toString() || '0',
        `${order.amount} ${order.currency}`,
        order.paymentStatus,
        order.paymentMethod,
        new Date(order.createdAt).toLocaleString('en-US', { hour12: true }),
      ];

      row.forEach((cell, i) => {
        const x = 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc.text(cell, x, y, { width: colWidths[i], align: 'left' });
      });

      y += itemHeight;

      if (index < orders.length - 1) {
        doc
          .moveTo(50, y - 5)
          .lineTo(750, y - 5)
          .stroke();
      }
    });

    doc.moveDown(2);
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text(`Total Orders: ${orders.length}`, 50, y + 20);
    doc.text(
      `Total Amount: ${orders.reduce((sum, o) => sum + (o.amount || 0), 0)} JOD`,
      50,
      y + 35,
    );

    doc.end();
  }
}
