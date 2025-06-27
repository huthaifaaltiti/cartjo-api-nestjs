import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';

import { Product, ProductSchema } from 'src/schemas/product.schema';
import { createMulterOptions } from 'src/common/utils/multerConfig';
import { MediaModule } from '../media/media.module';
import { JwtModule } from '../jwt/jwt.module';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { CategoryModule } from '../category/category.module';
import { Category, CategorySchema } from 'src/schemas/category.schema';
import { Modules } from 'src/enums/appModules.enum';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
    MulterModule.register(createMulterOptions(Modules.PRODUCT)),
    MediaModule,
    JwtModule,
    CategoryModule,
  ],
  providers: [ProductService],
  controllers: [ProductController],
  exports: [ProductService],
})
export class ProductModule {}
