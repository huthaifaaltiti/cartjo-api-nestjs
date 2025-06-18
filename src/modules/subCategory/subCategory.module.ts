import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';

import { SubCategoryService } from './subCategory.service';
import { SubCategoryController } from './subCategory.controller';

import { SubCategory, SubCategorySchema } from 'src/schemas/subCategory.schema';
import { createMulterOptions } from 'src/common/utils/multerConfig';
import { MediaModule } from '../media/media.module';
import { JwtModule } from '../jwt/jwt.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SubCategory.name, schema: SubCategorySchema },
    ]),
    MulterModule.register(createMulterOptions()),
    MediaModule,
    JwtModule,
  ],
  providers: [SubCategoryService],
  controllers: [SubCategoryController],
  exports: [SubCategoryService],
})
export class SubCategoryModule {}
