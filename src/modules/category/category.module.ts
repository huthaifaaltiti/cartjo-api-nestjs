import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';

import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

import { createMulterOptions } from 'src/common/utils/multerConfig';
import { MediaModule } from '../media/media.module';
import { JwtModule } from '../jwt/jwt.module';
import { Category, CategorySchema } from 'src/schemas/category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]),
    MulterModule.register(createMulterOptions()),
    MediaModule,
    JwtModule,
  ],
  providers: [CategoryService],
  controllers: [CategoryController],
  exports: [CategoryService],
})
export class CategoryModule {}