import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';

import { SubCategoryService } from './subCategory.service';
import { SubCategoryController } from './subCategory.controller';

import { SubCategory, SubCategorySchema } from 'src/schemas/subCategory.schema';
import { createMulterOptions } from 'src/common/utils/multerConfig';
import { MediaModule } from '../media/media.module';
import { JwtModule } from '../jwt/jwt.module';
import { CategoryModule } from '../category/category.module';
import { Category, CategorySchema } from 'src/schemas/category.schema';
import { Modules } from 'src/enums/appModules.enum';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubCategory.name, schema: SubCategorySchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    MulterModule.register(createMulterOptions(Modules.SUB_CATEGORY)),
    MediaModule,
    CategoryModule,
    JwtModule,
  ],
  providers: [SubCategoryService],
  controllers: [SubCategoryController],
  exports: [SubCategoryService],
})
export class SubCategoryModule {}
