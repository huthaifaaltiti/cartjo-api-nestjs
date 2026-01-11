import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { Category, CategorySchema } from 'src/schemas/category.schema';
import { MediaModule } from '../media/media.module';
import { JwtModule } from '../jwt/jwt.module';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { CategoryModule } from '../category/category.module';
import { TypeHintConfigModule } from '../typeHintConfig/typeHintConfig.module';
import { WishList, WishListSchema } from 'src/schemas/wishList.schema';
import { SubCategoryModule } from '../subCategory/subCategory.module';
import { SubCategory, SubCategorySchema } from 'src/schemas/subCategory.schema';
import { TypeHintConfig, TypeHintConfigSchema } from 'src/schemas/typeHintConfig.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
      { name: WishList.name, schema: WishListSchema },
      { name: SubCategory.name, schema: SubCategorySchema },
      { name: TypeHintConfig.name, schema: TypeHintConfigSchema },
    ]),
    MediaModule,
    JwtModule,
    forwardRef(() => CategoryModule),
    forwardRef(() => TypeHintConfigModule),
    forwardRef(() => SubCategoryModule),
  ],
  providers: [ProductService],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule {}
