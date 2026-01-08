import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SubCategoryService } from './subCategory.service';
import { SubCategoryController } from './subCategory.controller';
import { MediaModule } from '../media/media.module';
import { JwtModule } from '../jwt/jwt.module';
import { CategoryModule } from '../category/category.module';

import { SubCategory, SubCategorySchema } from 'src/schemas/subCategory.schema';
import { Category, CategorySchema } from 'src/schemas/category.schema';
import { RevalidationModule } from '../revalidation/revalidation.module';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubCategory.name, schema: SubCategorySchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    MediaModule,
    forwardRef(() => CategoryModule),
    JwtModule,
    RevalidationModule,
    forwardRef(() => ProductModule),
  ],
  providers: [SubCategoryService],
  controllers: [SubCategoryController],
  exports: [SubCategoryService],
})
export class SubCategoryModule {}
