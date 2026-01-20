import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from 'src/schemas/category.schema';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { MediaModule } from '../media/media.module';
import { JwtModule } from '../jwt/jwt.module';
import { SubCategoryModule } from '../subCategory/subCategory.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
    MediaModule,
    JwtModule,
    forwardRef(() => SubCategoryModule),
  ],
  providers: [CategoryService],
  controllers: [CategoryController],
  exports: [CategoryService],
})
export class CategoryModule {}
