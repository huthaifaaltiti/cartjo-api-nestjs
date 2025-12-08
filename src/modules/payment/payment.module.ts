import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cart, CartSchema } from 'src/schemas/cart.schema';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { CartModule } from '../cart/cart.module';
import { Order, OrderSchema } from 'src/schemas/order.schema';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    CartModule,
    OrderModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
