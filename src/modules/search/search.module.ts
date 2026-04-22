import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchController } from './search.controller';
import { Product, ProductSchema } from '../../schemas/product.schema';
import { WishList, WishListSchema } from '../../schemas/wishList.schema';
import { SearchService } from './search.service';
import {
  TypeHintConfig,
  TypeHintConfigSchema,
} from '../../schemas/typeHintConfig.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: WishList.name, schema: WishListSchema },
      { name: TypeHintConfig.name, schema: TypeHintConfigSchema },
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
