import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  Get,
  Query,
  Res,
} from '@nestjs/common';
import { ApiPaths } from 'src/common/constants/api-paths';
import { AuthGuard } from '@nestjs/passport';
import { OrderService } from './order.service';
import { ChangePaymentStatusBodyDto } from './dto/paymentStatus.dto';
import {
  DeleteOrderBodyDto,
  DeleteOrderParamsDto,
} from './dto/deleteOrder.dto';
import {
  RestoreOrderBodyDto,
  RestoreOrderParamsDto,
} from './dto/restoreOrder.dto';
import { GetOrdersQueryDto } from './dto/getOrders.dto';
import { CreateOrderBodyDto } from './dto/createOrder.dto';
import { GetOrderParamDto, GetOrderQueryDto } from './dto/getOrder.dto';
import { ExportOrdersQueryDto } from './dto/exportOrders.dto';
import { Response } from 'express';
<<<<<<< HEAD
=======
import {
  GetMyOrdersParamDto,
  GetMyOrdersQueryDto,
} from './dto/getMyOrders.dto';
import { GetMyOrderParamDto, GetMyOrderQueryDto } from './dto/getMyOrder.dto';
import { ChangeDeliveryStatusBodyDto } from './dto/deliveryStatus.dto';
import {
  GetMyOrderReturnsParamDto,
  GetMyOrderReturnsQueryDto,
} from './dto/getMyOrderReturns.dto';
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

@Controller(ApiPaths.Order.Root)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post(ApiPaths.Order.ChangePaymentStatus)
  async changePaidStatus(
    @Body() dto: ChangePaymentStatusBodyDto,
    @Request() req: any,
  ) {
    const { user } = req;

    return this.orderService.changePaidStatus(user, dto);
  }

  @UseGuards(AuthGuard('jwt'))
<<<<<<< HEAD
=======
  @Post(ApiPaths.Order.ChangeDeliveryStatus)
  async changeDeliveryStatus(
    @Body() dto: ChangeDeliveryStatusBodyDto,
    @Request() req: any,
  ) {
    const { user } = req;

    return this.orderService.changeDeliveryStatus(user, dto);
  }

  @UseGuards(AuthGuard('jwt'))
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
  @Post(ApiPaths.Order.Delete)
  async deleteOrder(
    @Request() req: any,
    @Body() body: DeleteOrderBodyDto,
    @Param() param: DeleteOrderParamsDto,
  ) {
    return this.orderService.softDeleteOrder(req.user, body, param);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(ApiPaths.Order.UnDelete)
  async restoreOrder(
    @Request() req: any,
    @Body() body: RestoreOrderBodyDto,
    @Param() param: RestoreOrderParamsDto,
  ) {
    return this.orderService.restoreOrder(req.user, body, param);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(ApiPaths.Order.Create)
  async createOrder(@Request() req: any, @Body() body: CreateOrderBodyDto) {
    const { user } = req;

    const cart = await this.orderService.getUserCart(user);

<<<<<<< HEAD
    return this.orderService.createOrderAndClearCart(
      user,
      cart,
      body.amount,
      body.currency,
      body.email,
      body.merchantReference,
      body.transactionId,
      body.paymentMethod,
      body.shippingAddress,
    );
=======
    return this.orderService.createOrderAndClearCart(user, cart, body);
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(ApiPaths.Order.GetAll)
  async getOrders(@Request() req: any, @Query() query: GetOrdersQueryDto) {
    const { user } = req;

    return this.orderService.getAll(user, query);
  }

  @UseGuards(AuthGuard('jwt'))
<<<<<<< HEAD
=======
  @Get(ApiPaths.Order.MyOrders)
  async getMyOrders(
    @Request() req: any,
    @Query() query: GetMyOrdersQueryDto,
    @Param() param: GetMyOrdersParamDto,
  ) {
    const { user } = req;

    return this.orderService.getMyOrders(user, query, param);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(ApiPaths.Order.MyReturns)
  async getMyOrderReturns(
    @Request() req: any,
    @Query() query: GetMyOrderReturnsQueryDto,
    @Param() param: GetMyOrderReturnsParamDto,
  ) {
    const { user } = req;

    return this.orderService.getMyOrderReturns(user, query, param);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(ApiPaths.Order.MyOrder)
  async getMyOrder(
    @Request() req: any,
    @Query() query: GetMyOrderQueryDto,
    @Param() param: GetMyOrderParamDto,
  ) {
    const { user } = req;
    return this.orderService.getMyOrder(user, query, param);
  }

  @UseGuards(AuthGuard('jwt'))
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
  @Get(ApiPaths.Order.Export)
  async exportOrders(
    @Request() req: any,
    @Query() query: ExportOrdersQueryDto,
    @Res() res: Response,
  ) {
    const { user } = req;
    return this.orderService.exportOrders(user, query, res);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(ApiPaths.Order.GetOne)
  async getOrder(
    @Request() req: any,
    @Param() param: GetOrderParamDto,
    @Query() query: GetOrderQueryDto,
  ) {
    return this.orderService.getOne(req, param, query);
  }
}
