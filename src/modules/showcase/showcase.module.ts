<<<<<<< HEAD
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ShowCase, ShowCaseSchema } from 'src/schemas/showcase.schema';

=======
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShowCase, ShowCaseSchema } from 'src/schemas/showcase.schema';
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
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
<<<<<<< HEAD
=======
import { ShowcaseSeeder } from 'src/database/seeders/showcases.seeder';
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShowCase.name, schema: ShowCaseSchema },
      { name: Product.name, schema: ProductSchema },
      { name: TypeHintConfig.name, schema: TypeHintConfigSchema },
      { name: WishList.name, schema: WishListSchema },
    ]),
    JwtModule,
<<<<<<< HEAD
    ProductModule,
    TypeHintConfigModule,
  ],
  providers: [ShowcaseService],
=======
    forwardRef(() => ProductModule),
    forwardRef(() => TypeHintConfigModule),
  ],
  providers: [ShowcaseService, ShowcaseSeeder],
>>>>>>> e2218e093cb759b61b7b96f0a7e2b9ccb5b89594
  controllers: [ShowcaseController],
  exports: [ShowcaseService],
})
export class ShowcaseModule {}
