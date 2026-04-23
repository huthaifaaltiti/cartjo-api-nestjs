import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TypeHintConfig,
  TypeHintConfigSchema,
} from '../../schemas/typeHintConfig.schema';
import { TypeHintConfigService } from './typeHintConfig.service';
import { TypeHintConfigController } from './typeHintConfig.controller';
import { ProductModule } from '../product/product.module';
import { ShowcaseModule } from '../showcase/showcase.module';
import { TypeHintsSeeder } from '../../database/seeders/type-hints.seeder';
import { ShowCase, ShowCaseSchema } from '../../schemas/showcase.schema';
import { Product, ProductSchema } from '../../schemas/product.schema';
import { HistoryModule } from '../history/history.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TypeHintConfig.name, schema: TypeHintConfigSchema },
      { name: ShowCase.name, schema: ShowCaseSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    forwardRef(() => ProductModule),
    forwardRef(() => ShowcaseModule),
    HistoryModule,
  ],
  providers: [TypeHintConfigService, TypeHintsSeeder],
  controllers: [TypeHintConfigController],
  exports: [TypeHintConfigService],
})
export class TypeHintConfigModule {}
