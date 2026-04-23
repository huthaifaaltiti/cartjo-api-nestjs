import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderService } from './order.service';
import { CartModule } from '../cart/cart.module';
import { OrderController } from './order.controller';
import { EmailModule } from '../email/email.module';
import { ProductModule } from '../product/product.module';
import { Order, OrderSchema } from '../../schemas/order.schema';
import { Cart, CartSchema } from '../../schemas/cart.schema';
import { Product, ProductSchema } from '../../schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Cart.name, schema: CartSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    CartModule,
    EmailModule,
    ProductModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
