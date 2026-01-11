<<<<<<< HEAD
import { Module } from '@nestjs/common';
=======
import { forwardRef, Module } from '@nestjs/common';
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
import { MongooseModule } from '@nestjs/mongoose';

import { SubCategoryService } from './subCategory.service';
import { SubCategoryController } from './subCategory.controller';
import { MediaModule } from '../media/media.module';
import { JwtModule } from '../jwt/jwt.module';
import { CategoryModule } from '../category/category.module';

import { SubCategory, SubCategorySchema } from 'src/schemas/subCategory.schema';
import { Category, CategorySchema } from 'src/schemas/category.schema';
import { RevalidationModule } from '../revalidation/revalidation.module';
<<<<<<< HEAD
=======
import { ProductModule } from '../product/product.module';
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubCategory.name, schema: SubCategorySchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    MediaModule,
<<<<<<< HEAD
    CategoryModule,
    JwtModule,
    RevalidationModule,
=======
    forwardRef(() => CategoryModule),
    JwtModule,
    RevalidationModule,
    forwardRef(() => ProductModule),
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
  ],
  providers: [SubCategoryService],
  controllers: [SubCategoryController],
  exports: [SubCategoryService],
})
export class SubCategoryModule {}
