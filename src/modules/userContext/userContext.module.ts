import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserContextService } from './userContext.service';
import { UserContextController } from './userContext.controller';
import { UserContext, UserContextSchema } from 'src/schemas/userContext.schema';
import { WishList, WishListSchema } from 'src/schemas/wishList.schema';
import { Cart, CartItemSchema } from 'src/schemas/cart.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserContext.name, schema: UserContextSchema },
      { name: WishList.name, schema: WishListSchema },
      { name: Cart.name, schema: CartItemSchema },
    ]),
  ],
  providers: [UserContextService],
  controllers: [UserContextController],
  exports: [UserContextService],
})
export class UserContextModule {}
