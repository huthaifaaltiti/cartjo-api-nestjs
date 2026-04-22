import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserContextService } from './userContext.service';
import { UserContextController } from './userContext.controller';
import { WishListModule } from '../wishList/wishList.module';
import { CartModule } from '../cart/cart.module';
import { User, UserSchema } from '../../schemas/user.schema';
import {
  UserContext,
  UserContextSchema,
} from '../../schemas/userContext.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserContext.name, schema: UserContextSchema },
      { name: User.name, schema: UserSchema },
    ]),
    WishListModule,
    CartModule,
  ],
  providers: [UserContextService],
  controllers: [UserContextController],
  exports: [UserContextService],
})
export class UserContextModule {}
