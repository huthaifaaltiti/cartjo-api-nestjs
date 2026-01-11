import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from 'src/schemas/order.schema';
import { OrderService } from './order.service';
import { CartModule } from '../cart/cart.module';
import { Cart, CartSchema } from 'src/schemas/cart.schema';
import { OrderController } from './order.controller';
import { EmailModule } from '../email/email.module';
<<<<<<< HEAD
=======
import { ProductModule } from '../product/product.module';
import { Product, ProductSchema } from 'src/schemas/product.schema';
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Cart.name, schema: CartSchema },
<<<<<<< HEAD
    ]),
    CartModule,
    EmailModule
=======
      { name: Product.name, schema: ProductSchema },
    ]),
    CartModule,
    EmailModule,
    ProductModule,
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
