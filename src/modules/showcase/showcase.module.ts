import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ShowCase, ShowCaseSchema } from 'src/schemas/showcase.schema';

import { JwtModule } from '../jwt/jwt.module';
import { ShowcaseService } from './showcase.service';
import { ShowcaseController } from './showcase.controller';
import { ProductModule } from '../product/product.module';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { TypeHintConfigModule } from '../typeHint/typeHintConfig.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShowCase.name, schema: ShowCaseSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    JwtModule,
    ProductModule,
    TypeHintConfigModule,
  ],
  providers: [ShowcaseService],
  controllers: [ShowcaseController],
  exports: [ShowcaseService],
})
export class ShowcaseModule {}
