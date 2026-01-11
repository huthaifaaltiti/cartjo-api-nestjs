import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShowCase, ShowCaseSchema } from 'src/schemas/showcase.schema';
import { JwtModule } from '../jwt/jwt.module';
import { ShowcaseService } from './showcase.service';
import { ShowcaseController } from './showcase.controller';
import { ProductModule } from '../product/product.module';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { TypeHintConfigModule } from '../typeHintConfig/typeHintConfig.module';
import {
  TypeHintConfig,
  TypeHintConfigSchema,
} from 'src/schemas/typeHintConfig.schema';
import { WishList, WishListSchema } from 'src/schemas/wishList.schema';
import { ShowcaseSeeder } from 'src/database/seeders/showcases.seeder';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShowCase.name, schema: ShowCaseSchema },
      { name: Product.name, schema: ProductSchema },
      { name: TypeHintConfig.name, schema: TypeHintConfigSchema },
      { name: WishList.name, schema: WishListSchema },
    ]),
    JwtModule,
    forwardRef(() => ProductModule),
    forwardRef(() => TypeHintConfigModule),
  ],
  providers: [ShowcaseService, ShowcaseSeeder],
  controllers: [ShowcaseController],
  exports: [ShowcaseService],
})
export class ShowcaseModule {}
