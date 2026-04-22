import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from '../../schemas/product.schema';
import { Category, CategorySchema } from '../../schemas/category.schema';
import { MediaModule } from '../media/media.module';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { CategoryModule } from '../category/category.module';
import { TypeHintConfigModule } from '../typeHintConfig/typeHintConfig.module';
import { WishList, WishListSchema } from '../../schemas/wishList.schema';
import { SubCategoryModule } from '../subCategory/subCategory.module';
import { SubCategory, SubCategorySchema } from '../../schemas/subCategory.schema';
import {
  TypeHintConfig,
  TypeHintConfigSchema,
} from '../../schemas/typeHintConfig.schema';
import { Cart, CartSchema } from '../../schemas/cart.schema';
import { HistoryModule } from '../history/history.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: WishList.name, schema: WishListSchema },
      { name: SubCategory.name, schema: SubCategorySchema },
      { name: TypeHintConfig.name, schema: TypeHintConfigSchema },
      { name: Cart.name, schema: CartSchema },
    ]),
    MediaModule,
    forwardRef(() => CategoryModule),
    forwardRef(() => TypeHintConfigModule),
    forwardRef(() => SubCategoryModule),
    HistoryModule,
  ],
  providers: [ProductService],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule {}
