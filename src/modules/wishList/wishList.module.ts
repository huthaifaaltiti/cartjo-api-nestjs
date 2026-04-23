import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductModule } from '../product/product.module';
import { WishListController } from './wishList.controller';
import { WishListService } from './wishList.service';
import { CartModule } from '../cart/cart.module';
import { WishList, WishListSchema } from '../../schemas/wishList.schema';
import { Cart, CartSchema } from '../../schemas/cart.schema';
import { Product, ProductSchema } from '../../schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WishList.name, schema: WishListSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Cart.name, schema: CartSchema },
    ]),
    ProductModule,
    CartModule,
  ],
  providers: [WishListService],
  controllers: [WishListController],
  exports: [WishListService],
})
export class WishListModule {}
