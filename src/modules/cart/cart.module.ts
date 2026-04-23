import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { ProductModule } from '../product/product.module';
import { Cart, CartSchema } from '../../schemas/cart.schema';
import { Product, ProductSchema } from '../../schemas/product.schema';
import { WishList, WishListSchema } from '../../schemas/wishList.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cart.name, schema: CartSchema },
      { name: Product.name, schema: ProductSchema },
      { name: WishList.name, schema: WishListSchema },
    ]),
    ProductModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
