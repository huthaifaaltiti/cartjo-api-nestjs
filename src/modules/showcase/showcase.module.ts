import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShowCase, ShowCaseSchema } from '../../schemas/showcase.schema';
import { ShowcaseService } from './showcase.service';
import { ShowcaseController } from './showcase.controller';
import { ProductModule } from '../product/product.module';
import { Product, ProductSchema } from '../../schemas/product.schema';
import { TypeHintConfigModule } from '../typeHintConfig/typeHintConfig.module';
import {
  TypeHintConfig,
  TypeHintConfigSchema,
} from '../../schemas/typeHintConfig.schema';
import { WishList, WishListSchema } from '../../schemas/wishList.schema';
import { ShowcaseSeeder } from '../../database/seeders/showcases.seeder';
import { HistoryModule } from '../history/history.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShowCase.name, schema: ShowCaseSchema },
      { name: Product.name, schema: ProductSchema },
      { name: TypeHintConfig.name, schema: TypeHintConfigSchema },
      { name: WishList.name, schema: WishListSchema },
    ]),
    forwardRef(() => ProductModule),
    forwardRef(() => TypeHintConfigModule),
    HistoryModule,
  ],
  providers: [ShowcaseService, ShowcaseSeeder],
  controllers: [ShowcaseController],
  exports: [ShowcaseService],
})
export class ShowcaseModule {}
