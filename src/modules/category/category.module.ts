<<<<<<< HEAD
import { Module } from '@nestjs/common';
=======
import { forwardRef, Module } from '@nestjs/common';
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from 'src/schemas/category.schema';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { MediaModule } from '../media/media.module';
import { JwtModule } from '../jwt/jwt.module';
<<<<<<< HEAD
=======
import { SubCategoryModule } from '../subCategory/subCategory.module';

>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
    ]),
    MediaModule,
    JwtModule,
<<<<<<< HEAD
=======
    forwardRef(() => SubCategoryModule),
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
  ],
  providers: [CategoryService],
  controllers: [CategoryController],
  exports: [CategoryService],
})
export class CategoryModule {}
