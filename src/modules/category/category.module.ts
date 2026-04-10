import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from 'src/schemas/category.schema';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { MediaModule } from '../media/media.module';
import { AppConfigModule } from '../appConfig/appConfig.module';
import { HistoryModule } from '../history/history.module';
import { SubCategoryModule } from '../subCategory/subCategory.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
    MediaModule,
    forwardRef(() => SubCategoryModule),
    AppConfigModule,
    HistoryModule,
  ],
  providers: [CategoryService],
  controllers: [CategoryController],
  exports: [CategoryService],
})
export class CategoryModule {}
