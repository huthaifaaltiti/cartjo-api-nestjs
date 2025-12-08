import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { Cart, CartSchema } from 'src/schemas/cart.schema';
import { ProductModule } from '../product/product.module';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { WishList, WishListSchema } from 'src/schemas/wishList.schema';

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
