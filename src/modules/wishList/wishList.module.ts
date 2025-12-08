import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '../jwt/jwt.module';
import { ProductModule } from '../product/product.module';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { WishListController } from './wishList.controller';
import { WishListService } from './wishList.service';
import { WishList, WishListSchema } from 'src/schemas/wishList.schema';
import { Cart, CartSchema } from 'src/schemas/cart.schema';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WishList.name, schema: WishListSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Cart.name, schema: CartSchema },
    ]),
    JwtModule,
    ProductModule,
    CartModule,
  ],
  providers: [WishListService],
  controllers: [WishListController],
  exports: [WishListService],
})
export class WishListModule {}
